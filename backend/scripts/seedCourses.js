require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const demoCourses = require("../data/courses");

async function seedCourses() {
  try {
    await connectDB();
    const existingCount = await Course.estimatedDocumentCount();
    if (existingCount > 0) {
      console.log("Course collection is not empty; no demo data was added.");
      return;
    }

    const records = demoCourses.map(({ id, ...course }) => course);
    await Course.insertMany(records);
    console.log(`Seeded ${records.length} demo courses.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedCourses().catch((error) => {
  console.error("Course seeding failed:", error.message);
  process.exitCode = 1;
});