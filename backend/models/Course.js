const mongoose = require("mongoose");

function isHttpUrl(value) {
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

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
      unique: true
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ""
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    level: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Beginner"
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    overview: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000
    },
    videoUrl: { type: String, trim: true, maxlength: 2048, validate: isHttpUrl, default: "" },
    pdfUrl: { type: String, trim: true, maxlength: 2048, validate: isHttpUrl, default: "" },
    practiceUrl: { type: String, trim: true, maxlength: 2048, validate: isHttpUrl, default: "" },
    materials: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
      validate: {
        validator: (materials) => Array.isArray(materials) && materials.length <= 100,
        message: "A course can contain at most 100 legacy materials"
      }
    }
  },
  { timestamps: true }
);

courseSchema.set("toJSON", {
  transform(_document, value) {
    value.id = String(value._id);
    return value;
  }
});

module.exports = mongoose.model("Course", courseSchema);