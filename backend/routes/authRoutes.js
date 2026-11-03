
const express = require("express");

const {
  register,
  login
} = require("../controllers/authController");

const {
  validateRegistration,
  validateLogin
} = require("../middleware/authValidation");

const router = express.Router();
const { rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again later." }
});

router.post("/register", validateRegistration, register);
router.post("/login", loginLimiter, validateLogin, login);

module.exports = router;
