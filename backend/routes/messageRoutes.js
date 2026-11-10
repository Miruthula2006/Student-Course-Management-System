const express = require("express");
const { rateLimit } = require("express-rate-limit");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getStudentConversation,
  sendStudentMessage,
  getAdminConversations,
  getAdminConversation,
  sendAdminMessage
} = require("../controllers/messageController");

const router = express.Router();
const messageRateLimit = rateLimit({
  windowMs: 10_000,
  limit: 10,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: "Message rate limit exceeded. Please wait before sending again."
  })
});

router.use(authenticateToken);
router.get("/conversation", authorizeRoles("student"), getStudentConversation);
router.post(
  "/conversation",
  authorizeRoles("student"),
  messageRateLimit,
  sendStudentMessage
);
router.get("/conversations", authorizeRoles("admin"), getAdminConversations);
router.get(
  "/conversations/:studentId",
  authorizeRoles("admin"),
  getAdminConversation
);
router.post(
  "/conversations/:studentId",
  authorizeRoles("admin"),
  messageRateLimit,
  sendAdminMessage
);

module.exports = router;
