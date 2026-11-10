const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    clientMessageId: { type: String, trim: true, maxlength: 100 }
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index(
  { sender: 1, recipient: 1, clientMessageId: 1 },
  { unique: true, partialFilterExpression: { clientMessageId: { $type: "string" } } }
);

module.exports = mongoose.model("Message", messageSchema);