
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Student = require("../models/Student");
const { isValidEmail, namePattern } = require("../utils/validation");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  // Check environment variables
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env"
    );
  }

  if (ADMIN_PASSWORD.length < 12 ||
      Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72) {
    throw new Error("Admin password must be at least 12 characters and no more than 72 bytes.");
  }

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  if (
    !isValidEmail(normalizedEmail) ||
    ADMIN_NAME.trim().length < 2 ||
    ADMIN_NAME.trim().length > 100 ||
    !namePattern.test(ADMIN_NAME.trim())
  ) {
    throw new Error("ADMIN_NAME and ADMIN_EMAIL must be valid.");
  }

  await connectDB();

  // Check whether this email already exists
  const existingAdmin = await Student.findOne({
    email: normalizedEmail
  });

  if (existingAdmin) {
    if (existingAdmin.role === "admin") {
      console.log("An administrator with this email already exists.");
      return;
    }

    throw new Error(
      "This email already belongs to a student. Choose another admin email."
    );
  }

  // Hash the administrator password
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create the administrator account
  await Student.create({
    name: ADMIN_NAME.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "admin"
  });

  console.log("Administrator account created successfully!");
}

createAdmin()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
