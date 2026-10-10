
const courses = require("../data/courses");

// GET all courses
const getCourses = (req, res) => {
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
};

module.exports = {
  getCourses
};
