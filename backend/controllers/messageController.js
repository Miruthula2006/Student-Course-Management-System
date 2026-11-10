const isObjectId = require("../utils/objectId");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Student = require("../models/Student");

const messageFields = "name role";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function findAdministrator() {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredEmail) {
    const administrator = await Student.findOne({
      email: configuredEmail,
      role: "admin"
    }).select("_id name").lean();
    if (!administrator) {
      throw createHttpError(503, "Administrator chat is not configured.");
    }
    return administrator;
  }

  const administrators = await Student.find({ role: "admin" })
    .select("_id name")
    .sort({ createdAt: 1 })
    .limit(2)
    .lean();
  if (administrators.length !== 1) {
    throw createHttpError(503, "Administrator chat is not configured.");
  }
  return administrators[0];
}

function assertAdministrator(req, administrator) {
  if (req.user.id !== String(administrator._id)) {
    throw createHttpError(403, "You are not authorized to manage these conversations.");
  }
}

function formatMessage(message, conversationId) {
  const formatParticipant = (participant) => ({
    name: participant?.name || "Former user",
    role: participant?.role || "unknown"
  });
  return {
    _id: String(message._id),
    text: message.text,
    sender: formatParticipant(message.sender),
    recipient: formatParticipant(message.recipient),
    createdAt: message.createdAt,
    ...(conversationId ? { conversationId: String(conversationId) } : {})
  };
}

async function loadConversation(senderId, recipientId) {
  const messages = await Message.find({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("sender", messageFields)
    .populate("recipient", messageFields)
    .lean();

  return messages.reverse().map((message) => formatMessage(message));
}

async function saveMessage({ senderId, recipientId, text, clientMessageId, req }) {
  let message;
  let wasCreated = true;
  try {
    message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
      clientMessageId
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    message = await Message.findOne({
      sender: senderId,
      recipient: recipientId,
      clientMessageId
    })
      .populate("sender", messageFields)
      .populate("recipient", messageFields)
      .lean();
    if (!message) throw error;
    wasCreated = false;
  }

  if (wasCreated) {
    message = await Message.findById(message._id)
      .populate("sender", messageFields)
      .populate("recipient", messageFields)
      .lean();
  }

  const conversationId = req.user.role === "admin" ? recipientId : undefined;
  const payload = formatMessage(message, conversationId);
  if (wasCreated) {
    const io = req.app.get("io");
    io?.to(`user:${String(senderId)}`).emit("receive_message", payload);
    io?.to(`user:${String(recipientId)}`).emit(
      "receive_message",
      formatMessage(
        message,
        req.user.role === "admin" ? undefined : senderId
      )
    );

    try {
      const notification = await Notification.create({
        recipient: recipientId,
        message: `New message from ${message.sender.name}`
      });
      io?.to(`user:${String(recipientId)}`).emit("new_notification", notification);
    } catch (error) {
      console.error("Unable to create message notification", {
        name: error.name,
        code: error.code
      });
    }
  }

  return payload;
}

function validateMessage(req) {
  const { text, clientMessageId } = req.body || {};
  if (
    typeof text !== "string" ||
    !text.trim() ||
    text.trim().length > 2000 ||
    typeof clientMessageId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientMessageId)
  ) {
    throw createHttpError(400, "Enter a message of 1 to 2,000 characters.");
  }
  return { text, clientMessageId };
}

async function getStudentConversation(req, res, next) {
  try {
    const administrator = await findAdministrator();
    const messages = await loadConversation(req.user.id, administrator._id);
    res.json({
      success: true,
      contact: { name: "Administrator", role: "admin" },
      messages
    });
  } catch (error) {
    next(error);
  }
}

async function sendStudentMessage(req, res, next) {
  try {
    const { text, clientMessageId } = validateMessage(req);
    const administrator = await findAdministrator();
    const message = await saveMessage({
      senderId: req.user.id,
      recipientId: administrator._id,
      text,
      clientMessageId,
      req
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
}

async function getAdminConversations(req, res, next) {
  try {
    const administrator = await findAdministrator();
    assertAdministrator(req, administrator);
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: administrator._id },
            { recipient: administrator._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", administrator._id] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$text" },
          updatedAt: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: Student.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { $match: { "student.role": "student" } },
      {
        $project: {
          _id: 0,
          studentId: { $toString: "$student._id" },
          studentName: "$student.name",
          lastMessage: 1,
          updatedAt: 1
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
}

async function getAdminConversation(req, res, next) {
  try {
    const administrator = await findAdministrator();
    assertAdministrator(req, administrator);
    if (!isObjectId(req.params.studentId)) {
      throw createHttpError(400, "Invalid student ID.");
    }
    const student = await Student.findOne({
      _id: req.params.studentId,
      role: "student"
    }).select("_id name").lean();
    if (!student) throw createHttpError(404, "Student not found.");

    const hasConversation = await Message.exists({
      $or: [
        { sender: student._id, recipient: administrator._id },
        { sender: administrator._id, recipient: student._id }
      ]
    });
    if (!hasConversation) throw createHttpError(404, "Conversation not found.");

    const messages = await loadConversation(student._id, administrator._id);
    res.json({
      success: true,
      contact: { name: student.name, role: "student" },
      messages
    });
  } catch (error) {
    next(error);
  }
}

async function sendAdminMessage(req, res, next) {
  try {
    const administrator = await findAdministrator();
    assertAdministrator(req, administrator);
    if (!isObjectId(req.params.studentId)) {
      throw createHttpError(400, "Invalid student ID.");
    }
    const { text, clientMessageId } = validateMessage(req);
    const student = await Student.findOne({
      _id: req.params.studentId,
      role: "student"
    }).select("_id").lean();
    if (!student) throw createHttpError(404, "Student not found.");

    const hasConversation = await Message.exists({
      $or: [
        { sender: student._id, recipient: administrator._id },
        { sender: administrator._id, recipient: student._id }
      ]
    });
    if (!hasConversation) throw createHttpError(404, "Conversation not found.");

    const message = await saveMessage({
      senderId: req.user.id,
      recipientId: student._id,
      text,
      clientMessageId,
      req
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudentConversation,
  sendStudentMessage,
  getAdminConversations,
  getAdminConversation,
  sendAdminMessage
};
