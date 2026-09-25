const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const { assertOwnedWorkspace } = require("./workspaceController");
const { extractText } = require("../utils/textExtractor");
const { chunkText, hashBuffer } = require("../services/chunkingService");
const { embedDocumentChunks } = require("../services/embeddingService");

async function listDocuments(req, res) {
  await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const documents = await Document.find({ workspace: req.params.workspaceId }).sort({ createdAt: -1 });
  res.json({ documents });
}

async function uploadDocument(req, res) {
  const workspace = await assertOwnedWorkspace(req.params.workspaceId, req.userId);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded (expected form field 'file')" });
  }

  const { buffer, originalname, mimetype } = req.file;
  const contentHash = hashBuffer(buffer);

  // Idempotency: only skip if this exact file was already SUCCESSFULLY ingested
  // into this workspace. A previous failed or stuck attempt should be retried,
  // not treated as done.
  const existing = await Document.findOne({ workspace: workspace._id, contentHash });
  if (existing && existing.status === "ready") {
    return res.status(200).json({
      document: existing,
      message: "This exact file was already ingested into this workspace — skipped duplicate.",
    });
  }

  // Reuse the existing (failed/stuck) record instead of creating a new one, since
  // (workspace, contentHash) is a unique index and a second insert would error.
  const doc =
    existing ||
    (await Document.create({
      workspace: workspace._id,
      filename: originalname,
      mimeType: mimetype,
      contentHash,
      status: "processing",
    }));

  if (existing) {
    // Clear out any partial chunks from the earlier failed attempt before redoing it.
    await Chunk.deleteMany({ document: doc._id, workspace: workspace._id });
    doc.status = "processing";
    doc.chunkCount = 0;
    await doc.save();
  }

  try {
    const text = await extractText(buffer, originalname, mimetype);
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      doc.status = "failed";
      await doc.save();
      return res.status(422).json({ error: "No extractable text found in this document" });
    }

    const vectors = await embedDocumentChunks(chunks.map((c) => c.text));

    const chunkDocs = chunks.map((c, i) => ({
      workspace: workspace._id,
      document: doc._id,
      documentName: doc.filename,
      chunkIndex: c.index,
      text: c.text,
      embedding: vectors[i],
    }));

    await Chunk.insertMany(chunkDocs);

    doc.status = "ready";
    doc.chunkCount = chunkDocs.length;
    await doc.save();

    res.status(201).json({ document: doc });
  } catch (err) {
    doc.status = "failed";
    await doc.save();
    throw err;
  }
}

async function deleteDocument(req, res) {
  const workspace = await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const doc = await Document.findOne({ _id: req.params.documentId, workspace: workspace._id });
  if (!doc) return res.status(404).json({ error: "Document not found in this workspace" });

  await Chunk.deleteMany({ document: doc._id, workspace: workspace._id });
  await doc.deleteOne();

  res.json({ message: "Document and its chunks deleted" });
}

module.exports = { listDocuments, uploadDocument, deleteDocument };
