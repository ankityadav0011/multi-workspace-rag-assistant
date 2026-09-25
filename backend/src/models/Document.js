const mongoose = require("mongoose");

// One record per uploaded file. contentHash is used to make ingestion idempotent:
// re-uploading the same file into the same workspace is detected and skipped.
const documentSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String },
    contentHash: { type: String, required: true, index: true },
    chunkCount: { type: Number, default: 0 },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
  },
  { timestamps: true }
);

// Same file content can't be ingested twice into the same workspace.
documentSchema.index({ workspace: 1, contentHash: 1 }, { unique: true });

module.exports = mongoose.model("Document", documentSchema);
