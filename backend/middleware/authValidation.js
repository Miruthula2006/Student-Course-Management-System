
function validateRegistration(req, res, next) {
  const {
    name,
    registerNumber,
    email,
    phone,
    department,
    year,
    password
  } = req.body;

  // Check required fields
  if (
    !name?.trim() ||
    !registerNumber?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !department?.trim() ||
    !year ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "All registration fields are required"
    });
  }

  // Validate email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  // Validate register number
  if (typeof registerNumber !== "string" ||
      registerNumber.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid register number"
    });
  }

  // Validate phone number
  const phonePattern = /^\+?[0-9]{10,15}$/;

  if (!phonePattern.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid phone number"
    });
  }

  // Validate year
  if (!["I", "II", "III"].includes(year)) {
    return res.status(400).json({
      success: false,
      message: "Year must be I, II, or III"
    });
  }

  // Validate password
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "Password must be between 12 and 72 characters"
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  if (password.length > 72) {
    return res.status(400).json({
      success: false,
      message: "Password must not exceed 72 characters"
    });
  }

  next();
}

module.exports = {
  validateRegistration,
  validateLogin
};
