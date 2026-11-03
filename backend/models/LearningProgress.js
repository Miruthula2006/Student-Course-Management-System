const mongoose = require("mongoose");

const learningProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: Number, min: 0, default: 0 },
    totalLessons: { type: Number, min: 1, required: true },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 }
  },
  { timestamps: true }
);

learningProgressSchema.index({ student: 1, course: 1 }, { unique: true });

learningProgressSchema.pre("validate", function calculateProgress(next) {
  if (this.completedLessons > this.totalLessons) {
    this.invalidate("completedLessons", "Completed lessons cannot exceed total lessons");
  } else if (this.totalLessons > 0) {
    this.progressPercent = Math.round((this.completedLessons / this.totalLessons) * 100);
  }
  next();
});

module.exports = mongoose.model("LearningProgress", learningProgressSchema);