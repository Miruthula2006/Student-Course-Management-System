
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

async function registerStudent({
  name,
  registerNumber,
  email,
  phone,
  department,
  year,
  password
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRegisterNumber = registerNumber.trim().toUpperCase();

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    const error = new Error("Password must be at least 12 characters and no more than 72 bytes");
    error.statusCode = 400;
    throw error;
  }

  // Check whether the email is already registered
  const existingEmail = await Student.findOne({
    email: normalizedEmail
  });

  if (existingEmail) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Check whether the register number is already registered
  const existingRegisterNumber = await Student.findOne({
    registerNumber: normalizedRegisterNumber
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
      registerNumber: normalizedRegisterNumber,
      email: normalizedEmail,
      phone: phone.trim(),
      department: department.trim(),
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
  const normalizedEmail = email.trim().toLowerCase();

  const student = await Student.findOne({
    email: normalizedEmail
  }).select("+passwordHash");

  if (
    !student ||
    !(await bcrypt.compare(password, student.passwordHash))
  ) {
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
