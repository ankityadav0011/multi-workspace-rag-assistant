const fetch = require("node-fetch");

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIMENSIONS = 768;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Gemini lets you tag *why* you're embedding text (document vs. query), which
// measurably improves retrieval quality — the two get slightly different vectors
// for the same text.
async function embedBatch(texts, taskType) {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("GEMINI_API_KEY is not set in the environment");
    err.status = 500;
    throw err;
  }
  if (texts.length === 0) return [];

  const url = `${BASE_URL}/${EMBED_MODEL}:batchEmbedContents?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    requests: texts.map((text) => ({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBED_DIMENSIONS,
    })),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Gemini embedding request failed (${res.status}): ${errText}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  return data.embeddings.map((e) => e.values);
}

// Used when ingesting document chunks into the vector store.
async function embedDocumentChunks(texts) {
  return embedBatch(texts, "RETRIEVAL_DOCUMENT");
}

// Used when embedding the user's question at query time.
async function embedQuery(text) {
  const [vector] = await embedBatch([text], "RETRIEVAL_QUERY");
  return vector;
}

module.exports = { embedDocumentChunks, embedQuery };
