
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

const authRateLimit = (message) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message }
});

router.post(
  "/register",
  authRateLimit("Too many registration attempts. Try again later."),
  validateRegistration,
  register
);
router.post(
  "/login",
  authRateLimit("Too many login attempts. Try again later."),
  validateLogin,
  login
);

module.exports = router;
