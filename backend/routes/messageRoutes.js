const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/:userId", authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ]
    }).sort({ createdAt: -1 }).limit(100).lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;