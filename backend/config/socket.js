const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

function initializeSocket(server) {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
  const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) throw new Error("Authentication required");
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
      const user = await Student.findById(decoded.sub).select("_id name role").lean();
      if (!user) throw new Error("User not found");
      socket.data.user = { id: String(user._id), name: user.name, role: user.role };
      next();
    } catch (_error) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const senderId = socket.data.user.id;
    const messageTimes = [];
    socket.join(`user:${senderId}`);

    socket.on("send_message", async (data, acknowledge) => {
      try {
        const now = Date.now();
        while (messageTimes.length && now - messageTimes[0] > 10000) messageTimes.shift();
        if (messageTimes.length >= 10) throw new Error("Message rate limit exceeded");

        const { recipientId, text } = data || {};
        if (
          !mongoose.isValidObjectId(recipientId) ||
          typeof text !== "string" ||
          !text.trim() ||
          text.trim().length > 2000
        ) throw new Error("Invalid message data");

        const recipient = await Student.findById(recipientId).select("_id").lean();
        if (!recipient) throw new Error("Recipient not found");

        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          text: text.trim()
        });
        messageTimes.push(now);
        const payload = {
          _id: String(message._id),
          sender: senderId,
          recipient: String(recipientId),
          text: message.text,
          createdAt: message.createdAt
        };

        io.to(`user:${senderId}`).to(`user:${recipientId}`).emit("receive_message", payload);
        const notification = await Notification.create({
          recipient: recipientId,
          message: `New message from ${socket.data.user.name}`
        });
        io.to(`user:${recipientId}`).emit("new_notification", notification);
        if (typeof acknowledge === "function") acknowledge({ success: true });
      } catch (error) {
        if (typeof acknowledge === "function") {
          acknowledge({ success: false, message: error.message || "Unable to send message" });
        }
      }
    });
  });

  return io;
}

module.exports = initializeSocket;