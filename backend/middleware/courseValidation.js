
const validateCourse = (req, res, next) => {
  const {
    courseName,
    courseCode,
    duration,
    category
  } = req.body;

  if (
    !courseName ||
    typeof courseName !== "string" ||
    !courseName.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Course name is required"
    });
  }

  if (
    !courseCode ||
    typeof courseCode !== "string" ||
    !courseCode.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Course code is required"
    });
  }

  if (
    !duration ||
    typeof duration !== "string" ||
    !duration.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Duration is required"
    });
  }

  if (
    !category ||
    typeof category !== "string" ||
    !category.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Category is required"
    });
  }

  next();
};

module.exports = validateCourse;
