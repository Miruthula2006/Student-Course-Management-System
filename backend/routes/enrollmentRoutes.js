const express = require("express");
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const crypto = require("crypto");
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
      .populate("course")
      .sort({ enrolledAt: -1 })
      .lean();
    res.json({ success: true, enrollments });
  } catch (error) {
    next(error);
  }
});

router.post("/", authorizeRoles("student"), async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!mongoose.isValidObjectId(courseId)) {
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
    if (!mongoose.isValidObjectId(courseId)) {
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
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    const progress = await LearningProgress.findOne({ student: req.user.id, course: courseId }).lean();
    if (!progress || progress.completedLessons < progress.totalLessons) {
      return res.status(400).json({ success: false, message: "Complete all lessons before completing the course" });
    }
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: courseId, status: { $in: ["active", "completed"] } },
      { $set: { status: "completed" } },
      { returnDocument: "after", runValidators: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: "Active enrollment not found" });
    let certificate = await Certificate.findOne({ student: req.user.id, course: courseId });
    if (!certificate) {
      certificate = await Certificate.create({
        student: req.user.id,
        course: courseId,
        certificateCode: `SCMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`
      });
      await Notification.create({
        recipient: req.user.id,
        message: `Course completed. Certificate ${certificate.certificateCode} is ready.`
      });
    }
    res.json({ success: true, message: "Course completed", enrollment, certificate });
  } catch (error) {
    next(error);
  }
});

module.exports = router;