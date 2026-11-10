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

const learningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    type: {
      type: String,
      required: true,
      enum: ["PDF", "Video", "Document", "Link", "Practice", "Reading"]
    },
    duration: { type: String, trim: true, default: "", maxlength: 80 },
    url: { type: String, trim: true, default: "", maxlength: 2048, validate: isHttpUrl },
    fileReference: { type: String, trim: true, default: "", maxlength: 500 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    order: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

learningResourceSchema.index({ course: 1, order: 1, createdAt: 1 });

module.exports = mongoose.model("LearningResource", learningResourceSchema);
