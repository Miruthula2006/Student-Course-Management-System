
const { isRecord, isValidEmail, validateStudentRegistration } = require("../utils/validation");

function validateRegistration(req, res, next) {
  const result = validateStudentRegistration(req.body);
  if (result.error) {
    return res.status(400).json({ success: false, message: result.error });
  }
  req.body = result.value;
  next();
}

function validateLogin(req, res, next) {
  if (!isRecord(req.body)) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }
  const { email, password } = req.body;
  if (
    Object.keys(req.body).some((field) => !["email", "password"].includes(field)) ||
    !isValidEmail(email) ||
    typeof password !== "string" ||
    !password ||
    password.length > 72 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid email and password are required."
    });
  }
  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = {
  validateRegistration,
  validateLogin
};
