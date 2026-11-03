
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");

function invalidCourseId(id) {
  return !mongoose.isValidObjectId(id);
}

function serializeCourse(course) {
  return { ...course, id: String(course._id) };
}

// GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses.map(serializeCourse)
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id
const getCourse = async (req, res, next) => {
  try {
    if (invalidCourseId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(req.params.id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      data: serializeCourse(course)
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/courses
const addCourse = async (req, res, next) => {
  try {
    const newCourse = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/courses/:id
const editCourse = async (req, res, next) => {
  try {
    if (invalidCourseId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No course fields supplied" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/courses/:id
const removeCourse = async (req, res, next) => {
  try {
    if (invalidCourseId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    await Promise.all([
      Enrollment.deleteMany({ course: deleted._id }),
      LearningProgress.deleteMany({ course: deleted._id }),
      Certificate.deleteMany({ course: deleted._id })
    ]);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  editCourse,
  removeCourse
};
