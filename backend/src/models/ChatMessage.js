const mongoose = require("mongoose");

const citationSchema = new mongoose.Schema(
  {
    documentName: String,
    chunkIndex: Number,
    snippet: String,
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citations: { type: [citationSchema], default: [] },
    toolCalls: [{ type: mongoose.Schema.Types.ObjectId, ref: "ToolCallLog" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
