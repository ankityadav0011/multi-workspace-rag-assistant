const mongoose = require("mongoose");

// THE shared vector store: every workspace's chunks live in this one collection.
// Isolation is enforced by filtering on `workspace` INSIDE the $vectorSearch stage
// (see services/retrievalService.js) — never by filtering results afterward.
const chunkSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    documentName: { type: String, required: true }, // denormalized for fast citations
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }, // 768-dim vector from Gemini text-embedding-004
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chunk", chunkSchema);
