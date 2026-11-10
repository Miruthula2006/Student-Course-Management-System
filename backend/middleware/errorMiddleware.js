
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : err.status;

  if (err.code === 11000) {
    statusCode = 409;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
  } else if (err.name === "CastError") {
    statusCode = 400;
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) statusCode = 500;

  if (process.env.NODE_ENV !== "test") {
    console.error("API request failed", {
      statusCode,
      errorName: err.name || "Error",
      errorCode: err.code,
      method: req.method,
      path: req.path
    });
  }

  const messages = {
    400: err.name === "CastError" ? "Invalid identifier" :
      err.type === "entity.parse.failed" ? "Malformed JSON request body" : "Invalid request",
    401: "Authentication required",
    403: "Access denied",
    404: "Resource not found",
    409: "Duplicate value or conflicting request",
    413: "Request body is too large",
    422: "Request could not be processed",
    429: "Too many requests"
  };
  const controlledMessage = statusCode < 500 &&
    err.statusCode === statusCode &&
    !["ValidationError", "CastError"].includes(err.name) &&
    err.type !== "entity.too.large" &&
    err.type !== "entity.parse.failed"
    ? err.message
    : undefined;
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" :
      (controlledMessage || messages[statusCode] || "Request failed")
  });
};

module.exports = errorHandler;
