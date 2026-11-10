const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const getAllowedOrigins = require("./origins");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
      credentials: false
    },
    maxHttpBufferSize: 64 * 1024
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) throw new Error("Authentication required");
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
      const user = await Student.findById(decoded.sub).select("_id name role").lean();
      if (!user || !["student", "admin"].includes(user.role)) {
        throw new Error("User not found");
      }
      socket.data.user = { id: String(user._id), name: user.name, role: user.role };
      next();
    } catch (error) {
      next(new Error(error.message === "Authentication required"
        ? error.message
        : "Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const senderId = socket.data.user.id;
    socket.join(`user:${senderId}`);
  });

  return io;
}

module.exports = initializeSocket;