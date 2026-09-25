const mongoose = require("mongoose");
const Chunk = require("../models/Chunk");
const { embedQuery } = require("./embeddingService");

const INDEX_NAME = "chunk_vector_index";
const TOP_K = 5;

// THIS is where tenant isolation is actually enforced: the `filter` on `workspace`
// is evaluated by Atlas as part of the vector search itself (because we defined
// `workspace` as a "filter" field on the index), not as a post-query .find() step.
async function retrieveRelevantChunks(workspaceId, questionText) {
  const queryVector = await embedQuery(questionText);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: INDEX_NAME,
        path: "embedding",
        queryVector,
        filter: { workspace: new mongoose.Types.ObjectId(workspaceId) },
        numCandidates: 100,
        limit: TOP_K,
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        documentName: 1,
        chunkIndex: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
}

module.exports = { retrieveRelevantChunks };