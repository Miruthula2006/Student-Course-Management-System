
const express = require("express");

const {
  getCourses,
  getCourse,
  addCourse,
  editCourse,
  removeCourse
} = require("../controllers/courseController");
const validateCourse = require("../middleware/courseValidation");

const router = express.Router();

// GET all courses
router.get("/", getCourses);

// GET one course
router.get("/:id", getCourse);

// CREATE a course
router.post("/", validateCourse, addCourse);

// UPDATE a course
router.put("/:id", editCourse);

// DELETE a course
router.delete("/:id", removeCourse);

module.exports = router;
