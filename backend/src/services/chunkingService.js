const crypto = require("crypto");

// Chunk size/overlap chosen as a reasonable default for RAG over short-to-medium
// documents (resumes, policies, notes): big enough to hold a full idea/sentence
// group for good embeddings, small enough to keep retrieval precise and citations
// pinpoint-able. Character-based (not token-based) to avoid a tokenizer dependency.
const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 150; // characters of overlap between consecutive chunks

// Deterministic hash of the raw file bytes. Used to detect "this exact file was
// already ingested into this workspace" so re-uploads don't create duplicate chunks.
function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Splits normalized text into overlapping chunks, indexed in order.
function chunkText(text) {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const slice = cleaned.slice(start, end).trim();
    if (slice) {
      chunks.push({ index, text: slice });
      index += 1;
    }
    if (end === cleaned.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

module.exports = { chunkText, hashBuffer };
