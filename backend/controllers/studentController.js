const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");

const publicFields = "name registerNumber email phone department year role createdAt updatedAt";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9]{10,15}$/;

async function getStudents(req, res, next) {
  try {
    const students = await Student.find({ role: "student" })
      .select(publicFields)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const student = await Student.findOne({ _id: req.params.id, role: "student" })
      .select(publicFields)
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const { name, registerNumber, email, phone, department, year, password } = req.body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof registerNumber !== "string" || !registerNumber.trim() ||
      typeof email !== "string" || !emailPattern.test(email.trim()) ||
      typeof phone !== "string" || !phonePattern.test(phone.trim()) ||
      typeof department !== "string" || !department.trim() ||
      !["I", "II", "III"].includes(year) ||
      typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({ success: false, message: "Valid student details and a password of at least 12 characters are required" });
    }

    const student = await Student.create({
      name: name.trim(),
      registerNumber: registerNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      year,
      passwordHash: await bcrypt.hash(password, 12),
      role: "student"
    });

    res.status(201).json({
      success: true,
      message: "Student created",
      student: {
        id: String(student._id),
        name: student.name,
        registerNumber: student.registerNumber,
        email: student.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
        role: student.role
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const updates = {};
    const { name, registerNumber, email, phone, department, year } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) return res.status(400).json({ success: false, message: "Invalid name" });
      updates.name = name.trim();
    }
    if (registerNumber !== undefined) {
      if (typeof registerNumber !== "string" || !registerNumber.trim()) return res.status(400).json({ success: false, message: "Invalid register number" });
      updates.registerNumber = registerNumber.trim().toUpperCase();
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !emailPattern.test(email.trim())) return res.status(400).json({ success: false, message: "Invalid email" });
      updates.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      if (typeof phone !== "string" || !phonePattern.test(phone.trim())) return res.status(400).json({ success: false, message: "Invalid phone number" });
      updates.phone = phone.trim();
    }
    if (department !== undefined) {
      if (typeof department !== "string" || !department.trim()) return res.status(400).json({ success: false, message: "Invalid department" });
      updates.department = department.trim();
    }
    if (year !== undefined) {
      if (!["I", "II", "III"].includes(year)) return res.status(400).json({ success: false, message: "Invalid year" });
      updates.year = year;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields supplied" });
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    ).select(publicFields);

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student updated", student });
  } catch (error) {
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const student = await Student.findOneAndDelete({ _id: req.params.id, role: "student" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    await Promise.all([
      Message.deleteMany({ $or: [{ sender: student._id }, { recipient: student._id }] }),
      Notification.deleteMany({ recipient: student._id }),
      Enrollment.deleteMany({ student: student._id }),
      LearningProgress.deleteMany({ student: student._id }),
      Certificate.deleteMany({ student: student._id })
    ]);
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };