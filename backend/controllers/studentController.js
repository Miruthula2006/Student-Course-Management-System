const bcrypt = require("bcryptjs");
const isObjectId = require("../utils/objectId");
const Student = require("../models/Student");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Certificate = require("../models/Certificate");
const {
  isRecord,
  isValidEmail,
  namePattern,
  phonePattern,
  registerNumberPattern,
  supportedYears,
  validateStudentRegistration
} = require("../utils/validation");

const publicFields = "name registerNumber email phone department year role createdAt updatedAt";

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
    if (!isObjectId(req.params.id)) {
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
    const validation = validateStudentRegistration(req.body);
    if (validation.error) return res.status(400).json({ success: false, message: validation.error });
    const { name, registerNumber, email, phone, department, year, password } = validation.value;

    const student = await Student.create({
      name,
      registerNumber,
      email,
      phone,
      department,
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
    if (!isObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    if (!isRecord(req.body)) {
      return res.status(400).json({ success: false, message: "Student fields are required" });
    }
    const allowedFields = ["name", "registerNumber", "email", "phone", "department", "year"];
    if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ success: false, message: "Student update contains unsupported fields" });
    }
    const updates = {};
    const { name, registerNumber, email, phone, department, year } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 || !namePattern.test(name.trim())) return res.status(400).json({ success: false, message: "Invalid name" });
      updates.name = name.trim();
    }
    if (registerNumber !== undefined) {
      if (typeof registerNumber !== "string" || registerNumber.trim().length > 30 || !registerNumberPattern.test(registerNumber.trim())) return res.status(400).json({ success: false, message: "Invalid register number" });
      updates.registerNumber = registerNumber.trim().toUpperCase();
    }
    if (email !== undefined) {
      if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
      updates.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      if (typeof phone !== "string" || !phonePattern.test(phone.trim())) return res.status(400).json({ success: false, message: "Invalid phone number" });
      updates.phone = phone.trim();
    }
    if (department !== undefined) {
      if (typeof department !== "string" || !department.trim() || department.trim().length > 120) return res.status(400).json({ success: false, message: "Invalid department" });
      updates.department = department.trim();
    }
    if (year !== undefined) {
      if (!supportedYears.has(year)) return res.status(400).json({ success: false, message: "Invalid year" });
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
    if (!isObjectId(req.params.id)) {
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