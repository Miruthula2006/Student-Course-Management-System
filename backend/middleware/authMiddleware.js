
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required."
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required."
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const student = await Student.findById(decoded.sub)
      .select("name email role")
      .lean();

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Account is no longer available."
      });
    }

    req.user = {
      id: String(student._id),
      email: student.email,
      name: student.name,
      role: student.role
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "CastError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token."
      });
    }

    return next(error);
  }
}

module.exports = authenticateToken;
