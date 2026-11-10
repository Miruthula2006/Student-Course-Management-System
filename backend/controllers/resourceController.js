const isObjectId = require("../utils/objectId");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const LearningResource = require("../models/LearningResource");
const { isRecord } = require("../utils/validation");

const resourceTypes = new Set(["PDF", "Video", "Document", "Link", "Practice", "Reading"]);
const editableFields = ["title", "description", "type", "duration", "url", "fileReference", "order"];

function validateFields(body, partial = false) {
  if (!isRecord(body)) return { error: "Resource fields are required" };
  if (Object.keys(body).some((field) => !editableFields.includes(field))) {
    return { error: "Resource contains unsupported fields" };
  }
  const updates = {};
  for (const field of editableFields) {
    if (body[field] === undefined) continue;
    updates[field] = body[field];
  }

  if (!partial || updates.title !== undefined) {
    if (typeof updates.title !== "string" || !updates.title.trim()) {
      return { error: "Resource title is required" };
    }
    updates.title = updates.title.trim();
  }
  if (!partial || updates.description !== undefined) {
    if (typeof updates.description !== "string" || !updates.description.trim()) {
      return { error: "Resource description is required" };
    }
    updates.description = updates.description.trim();
  }
  if (!partial || updates.type !== undefined) {
    if (typeof updates.type !== "string" || !resourceTypes.has(updates.type)) {
      return { error: "A valid resource type is required" };
    }
  }
  for (const field of ["url", "fileReference"]) {
    if (updates[field] === undefined) continue;
    if (typeof updates[field] !== "string") return { error: `${field} must be a string` };
    updates[field] = updates[field].trim();
    const maximumLength = field === "url" ? 2048 : 200;
    if (updates[field].length > maximumLength) return { error: `${field} is too long` };
    if (
      field === "fileReference" &&
      (/[\\/]/.test(updates[field]) || updates[field].includes("..") || /[\u0000-\u001f]/.test(updates[field]))
    ) return { error: "File references must be storage keys, not file paths" };
  }
  if (updates.duration !== undefined) {
    if (typeof updates.duration !== "string") return { error: "Resource duration must be a string" };
    updates.duration = updates.duration.trim();
    if (updates.duration.length > 80) return { error: "Resource duration is too long" };
  }
  if (updates.title && updates.title.length > 180) return { error: "Resource title is too long" };
  if (updates.description && updates.description.length > 5000) return { error: "Resource description is too long" };
  if (updates.url) {
    try {
      const parsed = new URL(updates.url);
      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password
      ) throw new Error("unsupported protocol");
    } catch {
      return { error: "Resource URL must be a valid HTTP or HTTPS URL" };
    }
  }
  if (updates.order !== undefined && (!Number.isInteger(updates.order) || updates.order < 0)) {
    return { error: "Resource order must be a non-negative integer" };
  }
  return { updates };
}

async function getCourseResources(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!isObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (!(await Course.exists({ _id: courseId }))) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (req.user.role === "student") {
      const enrollment = await Enrollment.exists({
        student: req.user.id,
        course: courseId,
        status: { $in: ["active", "completed"] }
      });
      if (!enrollment) {
        return res.status(403).json({ success: false, message: "Enroll in this course to access its learning resources" });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to access learning resources" });
    }

    const resources = await LearningResource.find({ course: courseId })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    next(error);
  }
}

async function createResource(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!isObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (!(await Course.exists({ _id: courseId }))) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const { updates, error } = validateFields(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const resource = await LearningResource.create({ ...updates, course: courseId });
    res.status(201).json({ success: true, message: "Learning resource created", resource });
  } catch (error) {
    next(error);
  }
}

async function updateResource(req, res, next) {
  try {
    const { resourceId } = req.params;
    if (!isObjectId(resourceId)) {
      return res.status(400).json({ success: false, message: "Invalid resource ID" });
    }
    const { updates, error } = validateFields(req.body, true);
    if (error) return res.status(400).json({ success: false, message: error });
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No resource fields supplied" });
    }

    const resource = await LearningResource.findByIdAndUpdate(
      resourceId,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: "Learning resource not found" });
    res.json({ success: true, message: "Learning resource updated", resource });
  } catch (error) {
    next(error);
  }
}

async function deleteResource(req, res, next) {
  try {
    const { resourceId } = req.params;
    if (!isObjectId(resourceId)) {
      return res.status(400).json({ success: false, message: "Invalid resource ID" });
    }
    const resource = await LearningResource.findByIdAndDelete(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: "Learning resource not found" });

    await LearningProgress.updateMany(
      { course: resource.course, completedResources: resource._id },
      { $pull: { completedResources: resource._id } }
    );
    const remaining = await LearningResource.find({ course: resource.course }).select("_id").lean();
    const remainingIds = new Set(remaining.map((item) => String(item._id)));
    const progressRecords = await LearningProgress.find({ course: resource.course });
    for (const progress of progressRecords) {
      const completed = progress.completedResources.filter((id) => remainingIds.has(String(id))).length;
      progress.completedResources = progress.completedResources.filter((id) => remainingIds.has(String(id)));
      progress.totalLessons = remaining.length;
      progress.completedLessons = completed;
      progress.progressPercent = remaining.length ? Math.round((completed / remaining.length) * 100) : 0;
      await progress.save();
    }

    res.json({ success: true, message: "Learning resource deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCourseResources, createResource, updateResource, deleteResource };
