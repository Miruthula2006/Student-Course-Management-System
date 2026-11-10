
const { isRecord } = require("../utils/validation");

const editableFields = [
  "courseName",
  "courseCode",
  "instructor",
  "duration",
  "level",
  "category",
  "status",
  "overview",
  "videoUrl",
  "pdfUrl",
  "practiceUrl",
  "materials"
];
const ignoredCompatibilityFields = new Set([
  "id",
  "_id",
  "createdAt",
  "updatedAt",
  "resourceCount"
]);
const fieldLimits = {
  courseName: 120,
  courseCode: 30,
  instructor: 120,
  duration: 40,
  level: 50,
  category: 80,
  overview: 5000,
  videoUrl: 2048,
  pdfUrl: 2048,
  practiceUrl: 2048
};
const urlFields = new Set(["videoUrl", "pdfUrl", "practiceUrl"]);
const materialFields = new Set([
  "title",
  "type",
  "description",
  "content",
  "duration",
  "url",
  "icon",
  "order"
]);

function validateUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password;
  } catch {
    return false;
  }
}

function validateMaterials(materials) {
  if (!Array.isArray(materials) || materials.length > 100) return null;
  const result = [];
  for (const material of materials) {
    if (
      !isRecord(material) ||
      Object.keys(material).some((field) => !materialFields.has(field))
    ) return null;
    const clean = {};
    for (const [field, value] of Object.entries(material)) {
      if (field === "order") {
        if (!Number.isInteger(value) || value < 0) return null;
        clean.order = value;
      } else {
        const maximum = field === "url" ? 2048 : 5000;
        if (typeof value !== "string" || value.length > maximum) return null;
        const cleanValue = value.trim();
        if (field === "url" && !validateUrl(cleanValue)) return null;
        clean[field] = cleanValue;
      }
    }
    result.push(clean);
  }
  return result;
}

function validateCourse(req, res, next) {
  const body = req.body;
  if (!isRecord(body)) {
    return res.status(400).json({ success: false, message: "Course fields are required" });
  }
  const unexpected = Object.keys(body).filter(
    (field) => !editableFields.includes(field) && !ignoredCompatibilityFields.has(field)
  );
  if (unexpected.length) {
    return res.status(400).json({ success: false, message: "Course contains unsupported fields" });
  }

  const course = {};
  for (const field of editableFields) {
    if (body[field] === undefined) continue;
    if (field === "materials") {
      const materials = validateMaterials(body.materials);
      if (!materials) {
        return res.status(400).json({ success: false, message: "Course materials must be an array of at most 100 items" });
      }
      course.materials = materials;
      continue;
    }
    if (typeof body[field] !== "string") {
      return res.status(400).json({ success: false, message: `Course ${field} must be a string` });
    }
    const value = body[field].trim();
    if (value.length > fieldLimits[field]) {
      return res.status(400).json({ success: false, message: `Course ${field} is too long` });
    }
    if (urlFields.has(field) && !validateUrl(value)) {
      return res.status(400).json({ success: false, message: `${field} must be a valid HTTP or HTTPS URL` });
    }
    course[field] = field === "courseCode" ? value.toUpperCase() : value;
  }

  if (req.method === "POST") {
    for (const field of ["courseName", "courseCode", "duration", "category"]) {
      if (!course[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      }
    }
  } else if (Object.keys(course).length === 0) {
    return res.status(400).json({ success: false, message: "No course fields supplied" });
  }
  if (course.status && !["Active", "Inactive"].includes(course.status)) {
    return res.status(400).json({ success: false, message: "Course status must be Active or Inactive" });
  }
  req.validatedCourse = course;
  next();
}

module.exports = validateCourse;
