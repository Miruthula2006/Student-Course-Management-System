const express = require("express");
const isObjectId = require("../utils/objectId");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const LearningProgress = require("../models/LearningProgress");
const LearningResource = require("../models/LearningResource");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const { isRecord } = require("../utils/validation");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(authenticateToken);

router.get("/", authorizeRoles("admin"), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "name email registerNumber")
      .populate("course", "courseName courseCode")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", authorizeRoles("student"), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id, status: { $ne: "withdrawn" } })
      .populate("course", "courseName courseCode instructor duration category level overview status")
      .sort({ enrolledAt: -1 })
      .lean();
    const courseIds = enrollments.map((item) => item.course?._id).filter(Boolean);
    const counts = await LearningResource.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]);
    const resourceCounts = new Map(counts.map((item) => [String(item._id), item.count]));
    const populatedEnrollments = enrollments.map((item) => ({
      ...item,
      course: item.course && {
        ...item.course,
        resourceCount: resourceCounts.get(String(item.course._id)) || 0
      }
    }));
    res.json({ success: true, enrollments: populatedEnrollments });
  } catch (error) {
    next(error);
  }
});

router.post("/", authorizeRoles("student"), async (req, res, next) => {
  try {
    if (!isRecord(req.body) ||
        Object.keys(req.body).some((field) => field !== "courseId")) {
      return res.status(400).json({ success: false, message: "A course ID is required" });
    }
    const { courseId } = req.body;
    if (!isObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (!(await Course.exists({ _id: courseId }))) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let enrollment = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (enrollment && enrollment.status !== "withdrawn") {
      return res.status(409).json({ success: false, message: "Already enrolled in this course" });
    }
    if (enrollment) {
      enrollment.status = "active";
      enrollment.enrolledAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({ student: req.user.id, course: courseId });
    }
    await enrollment.populate("course");
    res.status(201).json({ success: true, message: "Enrolled successfully", enrollment });
  } catch (error) {
    next(error);
  }
});

router.patch("/:courseId/withdraw", authorizeRoles("student"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!isObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: courseId, status: { $ne: "withdrawn" } },
      { $set: { status: "withdrawn" } },
      { returnDocument: "after", runValidators: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, message: "Enrollment withdrawn", enrollment });
  } catch (error) {
    next(error);
  }
});

router.patch("/:courseId/complete", authorizeRoles("student"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!isObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: { $in: ["active", "completed"] }
    });
    if (!enrollment) return res.status(403).json({ success: false, message: "An active enrollment is required to complete this course" });

    const resources = await LearningResource.find({ course: courseId }).select("_id").lean();
    if (resources.length === 0) {
      return res.status(400).json({ success: false, message: "This course has no learning resources yet and cannot be completed" });
    }
    const progress = await LearningProgress.findOne({ student: req.user.id, course: courseId });
    const completed = new Set((progress?.completedResources || []).map(String));
    const incompleteCount = resources.filter((resource) => !completed.has(String(resource._id))).length;
    if (incompleteCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Complete all learning resources before completing the course (${incompleteCount} remaining)`
      });
    }

    if (!progress) {
      return res.status(409).json({ success: false, message: "Course progress is not available yet" });
    }
    progress.completedLessons = resources.length;
    progress.totalLessons = resources.length;
    progress.progressPercent = 100;
    await progress.save();
    enrollment.status = "completed";
    await enrollment.save();
    let certificate = await Certificate.findOne({ student: req.user.id, course: courseId });
    let certificateCreated = false;
    if (!certificate) {
      try {
        certificate = await Certificate.create({
          student: req.user.id,
          course: courseId,
          certificateCode: `SCMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`
        });
        certificateCreated = true;
      } catch (error) {
        if (error.code !== 11000) throw error;
        certificate = await Certificate.findOne({ student: req.user.id, course: courseId });
      }
    }
    if (certificateCreated) {
      await Notification.create({
        recipient: req.user.id,
        message: `Course completed. Certificate ${certificate.certificateCode} is ready.`
      });
    }
    res.json({ success: true, message: "Course completed", enrollment, progress, certificate });
  } catch (error) {
    next(error);
  }
});

module.exports = router;