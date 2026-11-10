const express = require("express");
const LearningProgress = require("../models/LearningProgress");
const LearningResource = require("../models/LearningResource");
const Enrollment = require("../models/Enrollment");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const isObjectId = require("../utils/objectId");

const router = express.Router();
router.use(authenticateToken, authorizeRoles("student"));

router.get("/mine", async (req, res, next) => {
  try {
    const records = await LearningProgress.find({ student: req.user.id })
      .populate("course", "courseName courseCode")
      .sort({ updatedAt: -1 })
      .lean();
    const courseIds = records.map((item) => item.course?._id).filter(Boolean);
    const resources = await LearningResource.find({ course: { $in: courseIds } }).select("_id course").lean();
    const resourcesByCourse = new Map();
    for (const resource of resources) {
      const key = String(resource.course);
      if (!resourcesByCourse.has(key)) resourcesByCourse.set(key, new Set());
      resourcesByCourse.get(key).add(String(resource._id));
    }
    const progress = records.map((item) => serializeProgress(item, resourcesByCourse));
    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
});

function serializeProgress(record, resourcesByCourse) {
  const courseId = String(record.course?._id || record.course);
  const courseResources = resourcesByCourse.get(courseId) || new Set();
  const completedResourceIds = (record.completedResources || [])
    .map(String)
    .filter((resourceId) => courseResources.has(resourceId));
  const totalLessons = courseResources.size;
  const completedLessons = completedResourceIds.length;
  return {
    ...record,
    completedResourceIds,
    completedLessons,
    totalLessons,
    progressPercent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  };
}

router.post("/:courseId/resources/:resourceId/complete", async (req, res, next) => {
  try {
    const { courseId, resourceId } = req.params;
    if (!isObjectId(courseId) || !isObjectId(resourceId)) {
      return res.status(400).json({ success: false, message: "Invalid course or resource ID" });
    }
    const enrollment = await Enrollment.exists({
      student: req.user.id,
      course: courseId,
      status: { $in: ["active", "completed"] }
    });
    if (!enrollment) return res.status(403).json({ success: false, message: "An active enrollment is required" });

    const resource = await LearningResource.findOne({ _id: resourceId, course: courseId }).select("_id").lean();
    if (!resource) return res.status(404).json({ success: false, message: "Learning resource not found for this course" });
    const totalLessons = await LearningResource.countDocuments({ course: courseId });

    const record = await LearningProgress.findOneAndUpdate(
      { student: req.user.id, course: courseId },
      {
        $addToSet: { completedResources: resource._id },
        $set: { totalLessons },
        $setOnInsert: { completedLessons: 0, progressPercent: 0 }
      },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const resources = await LearningResource.find({ course: courseId }).select("_id course").lean();
    const resourcesByCourse = new Map([[String(courseId), new Set(resources.map((item) => String(item._id)))] ]);
    const serialized = serializeProgress(record.toObject(), resourcesByCourse);
    record.completedLessons = serialized.completedLessons;
    record.totalLessons = serialized.totalLessons;
    record.progressPercent = serialized.progressPercent;
    await record.save();
    res.json({ success: true, message: "Resource completion saved", progress: serialized });
  } catch (error) {
    next(error);
  }
});

router.put("/:courseId", (req, res) => {
  res.status(410).json({
    success: false,
    message: "Lesson counts are server-calculated. Complete an individual learning resource instead."
  });
});

module.exports = router;