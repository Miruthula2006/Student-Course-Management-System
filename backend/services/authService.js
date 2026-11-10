
const bcrypt = require("bcryptjs");
const { validateStudentRegistration, isValidEmail } = require("../utils/validation");
const Student = require("../models/Student");

async function registerStudent(input) {
  const validation = validateStudentRegistration(input);
  if (validation.error) {
    const error = new Error(validation.error);
    error.statusCode = 400;
    throw error;
  }
  const {
    name,
    registerNumber,
    email,
    phone,
    department,
    year,
    password
  } = validation.value;

  // Check whether the email is already registered
  const existingEmail = await Student.findOne({
    email
  });

  if (existingEmail) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Check whether the register number is already registered
  const existingRegisterNumber = await Student.findOne({
    registerNumber
  });

  if (existingRegisterNumber) {
    const error = new Error("Register number is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before saving
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const student = await Student.create({
      name: name.trim(),
      registerNumber,
      email,
      phone,
      department,
      year,
      passwordHash,
      role: "student"
    });

    return {
      id: String(student._id),
      name: student.name,
      registerNumber: student.registerNumber,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
      role: student.role,
      createdAt: student.createdAt
    };
  } catch (error) {
    // Handle duplicate values even if two requests arrive together
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      const message =
        duplicateField === "registerNumber"
          ? "Register number is already registered"
          : "Email is already registered";

      const duplicateError = new Error(message);
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function loginStudent({ email, password }) {
  if (
    !isValidEmail(email) ||
    typeof password !== "string" ||
    password.length > 72 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const student = await Student.findOne({
    email: email.trim().toLowerCase()
  }).select("+passwordHash");

  const passwordMatches = student
    ? await bcrypt.compare(password, student.passwordHash)
    : await bcrypt.hash(password, 12).then(() => false);
  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: String(student._id),
    name: student.name,
    registerNumber: student.registerNumber,
    email: student.email,
    phone: student.phone,
    department: student.department,
    year: student.year,
    role: student.role,
    createdAt: student.createdAt
  };
}

module.exports = {
  registerStudent,
  loginStudent
};
