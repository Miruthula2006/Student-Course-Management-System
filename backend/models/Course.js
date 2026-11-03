const mongoose = require("mongoose");

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
    videoUrl: { type: String, trim: true, default: "" },
    pdfUrl: { type: String, trim: true, default: "" },
    practiceUrl: { type: String, trim: true, default: "" },
    materials: { type: [mongoose.Schema.Types.Mixed], default: [] }
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