const mongoose = require("mongoose");

const toolCallLogSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    toolName: { type: String, required: true },
    args: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ["success", "error", "rejected"], required: true },
    result: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToolCallLog", toolCallLogSchema);
