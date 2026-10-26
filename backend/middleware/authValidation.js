
function validateRegistration(req, res, next) {
  const { name, email, password, department } = req.body;

  if (
    !name?.trim() ||
    !email?.trim() ||
    !password ||
    !department?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, and department are required"
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    return res.status(400).json({
      success: false,
      message: "Password must be between 8 and 72 characters"
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
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

  if (typeof password !== "string" || password.length > 72) {
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
