
const isObjectId = require("../utils/objectId");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const LearningResource = require("../models/LearningResource");

function invalidCourseId(id) {
  return !isObjectId(id);
}

function serializeCourse(course, resourceCount = 0) {
  const safeCourse = { ...course };
  const id = String(safeCourse._id);
  delete safeCourse._id;
  delete safeCourse.materials;
  return { ...safeCourse, id, resourceCount };
}

// GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().select("-materials").sort({ createdAt: -1 }).lean();
    const counts = await LearningResource.aggregate([
      { $match: { course: { $in: courses.map((course) => course._id) } } },
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]);
    const resourceCounts = new Map(counts.map((item) => [String(item._id), item.count]));

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses.map((course) => serializeCourse(course, resourceCounts.get(String(course._id)) || 0))
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

    const course = await Course.findById(req.params.id).select("-materials").lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const resourceCount = await LearningResource.countDocuments({ course: course._id });
    res.status(200).json({
      success: true,
      data: serializeCourse(course, resourceCount)
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/courses
const addCourse = async (req, res, next) => {
  try {
    const newCourse = await Course.create(req.validatedCourse);

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

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.validatedCourse },
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
