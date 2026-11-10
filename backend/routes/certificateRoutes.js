const express = require("express");
const Certificate = require("../models/Certificate");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const isObjectId = require("../utils/objectId");

const router = express.Router();
router.use(authenticateToken);

router.get("/mine", authorizeRoles("student"), async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("course", "courseName courseCode instructor")
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
});

router.get("/", authorizeRoles("admin"), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.studentId) {
      if (typeof req.query.studentId !== "string" ||
          !isObjectId(req.query.studentId)) {
        return res.status(400).json({ success: false, message: "Invalid student ID" });
      }
      filter.student = req.query.studentId;
    }
    const certificates = await Certificate.find(filter)
      .populate("student", "name email registerNumber")
      .populate("course", "courseName courseCode instructor")
      .sort({ issuedAt: -1 })
      .lean();
    res.json({ success: true, certificates });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid certificate ID" });
    }
    const filter = { _id: req.params.id };
    if (req.user.role !== "admin") filter.student = req.user.id;
    const certificate = await Certificate.findOne(filter)
      .populate("student", "name registerNumber")
      .populate("course", "courseName courseCode instructor")
      .lean();
    if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
});

module.exports = router;