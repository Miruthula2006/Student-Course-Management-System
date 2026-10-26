
const {
  registerStudent,
  loginStudent
} = require("../services/authService");

async function register(req, res, next) {
  try {
    const student = await registerStudent(req.body);

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const student = await loginStudent(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: student
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login
};
