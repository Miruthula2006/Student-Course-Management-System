
const courses = require("../data/courses");

// Get all courses
const getAllCourses = () => {
  return courses;
};

// Get one course by ID
const getCourseById = (id) => {
  return courses.find(
    (course) => course.id === id
  );
};

// Add a new course
const createCourse = (courseData) => {
  const newCourse = {
    ...courseData,
    id: Date.now().toString()
  };

  courses.push(newCourse);
  return newCourse;
};

// Update an existing course
const updateCourse = (id, courseData) => {
  const index = courses.findIndex(
    (course) => course.id === id
  );

  if (index === -1) {
    return null;
  }

  courses[index] = {
    ...courses[index],
    ...courseData,
    id
  };

  return courses[index];
};

// Delete a course
const deleteCourse = (id) => {
  const index = courses.findIndex(
    (course) => course.id === id
  );

  if (index === -1) {
    return false;
  }

  courses.splice(index, 1);
  return true;
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
