
const mongoose = require("mongoose");
const {
  namePattern,
  isValidEmail,
  phonePattern,
  registerNumberPattern,
  supportedYears
} = require("../utils/validation");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      match: namePattern
    },

    registerNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
      match: registerNumberPattern
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      validate: isValidEmail
    },

    phone: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
      match: phonePattern
    },

    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
      maxlength: 120
    },

    year: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      enum: [...supportedYears]
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
      minlength: 60,
      maxlength: 60
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", studentSchema);
