
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const students = require("../data/students");

async function registerStudent({ name, email, password, department }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingStudent = students.find(
    (student) => student.email === normalizedEmail
  );

  if (existingStudent) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const student = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    department: department.trim(),
    createdAt: new Date().toISOString()
  };

  students.push(student);

  const { passwordHash: _, ...safeStudent } = student;
  return safeStudent;
}

async function loginStudent({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const student = students.find(
    (student) => student.email === normalizedEmail
  );

  if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { passwordHash: _, ...safeStudent } = student;
  return safeStudent;
}

module.exports = {
  registerStudent,
  loginStudent
};
