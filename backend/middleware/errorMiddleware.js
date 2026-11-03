
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (process.env.NODE_ENV !== "test") console.error(err);

  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : err.status;
  let message = err.message;

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) statusCode = 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : message || "Request failed",
    ...(err.name === "ValidationError" && {
      errors: Object.values(err.errors).map((item) => item.message)
    })
  });
};

module.exports = errorHandler;
