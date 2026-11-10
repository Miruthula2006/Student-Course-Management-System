
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const http = require("http");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const initializeSocket = require("./config/socket");
const getAllowedOrigins = require("./config/origins");

const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const courseRoutes = require("./routes/courseRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
app.set("io", io);
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(cors({
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin not allowed");
    error.statusCode = 403;
    return callback(error);
  }
}));
morgan.token("safe-path", (req) => req.originalUrl.split("?")[0]);
app.use(morgan(":method :safe-path :status :response-time ms"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb", parameterLimit: 100 }));

app.get("/", (req, res) => {
  res.json({
    message: "Student Course Management API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/progress", learningProgressRoutes);
app.use("/api/v1/certificates", certificateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", { name: error.name, code: error.code });
    process.exit(1);
  }
};

if (require.main === module) {
  process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection", { name: error?.name, code: error?.code });
    server.close(() => process.exit(1));
  });
  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception", { name: error?.name, code: error?.code });
    server.close(() => process.exit(1));
  });
  process.on("SIGTERM", () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  });
  startServer();
}

module.exports = { app, server, startServer };
