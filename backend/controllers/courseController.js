
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require("../services/courseService");

// GET /api/courses
const getCourses = (req, res) => {
  const courses = getAllCourses();

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
};

// GET /api/courses/:id
const getCourse = (req, res) => {
  const course = getCourseById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  res.status(200).json({
    success: true,
    data: course
  });
};

// POST /api/courses
const addCourse = (req, res) => {
  const newCourse = createCourse(req.body);

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: newCourse
  });
};

// PUT /api/courses/:id
const editCourse = (req, res) => {
  const updatedCourse = updateCourse(
    req.params.id,
    req.body
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
};

// DELETE /api/courses/:id
const removeCourse = (req, res) => {
  const deleted = deleteCourse(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Course deleted successfully"
  });
};

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  editCourse,
  removeCourse
};
