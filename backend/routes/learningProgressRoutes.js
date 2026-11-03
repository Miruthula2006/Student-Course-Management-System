const express = require("express");
const mongoose = require("mongoose");
const LearningProgress = require("../models/LearningProgress");
const Enrollment = require("../models/Enrollment");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(authenticateToken, authorizeRoles("student"));

router.get("/mine", async (req, res, next) => {
  try {
    const progress = await LearningProgress.find({ student: req.user.id })
      .populate("course", "courseName courseCode")
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
});

router.put("/:courseId", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { completedLessons, totalLessons } = req.body;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (
      !Number.isInteger(completedLessons) ||
      !Number.isInteger(totalLessons) ||
      totalLessons < 1 ||
      completedLessons < 0 ||
      completedLessons > totalLessons
    ) {
      return res.status(400).json({ success: false, message: "Valid completedLessons and totalLessons are required" });
    }

    const enrollment = await Enrollment.exists({
      student: req.user.id,
      course: courseId,
      status: { $in: ["active", "completed"] }
    });
    if (!enrollment) return res.status(403).json({ success: false, message: "An active enrollment is required" });

    const progress = await LearningProgress.findOneAndUpdate(
      { student: req.user.id, course: courseId },
      { $set: { completedLessons, totalLessons, progressPercent: Math.round(completedLessons / totalLessons * 100) } },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("course", "courseName courseCode");
    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
});

module.exports = router;