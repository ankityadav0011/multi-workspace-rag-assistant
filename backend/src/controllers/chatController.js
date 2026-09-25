const ChatMessage = require("../models/ChatMessage");
const { assertOwnedWorkspace } = require("./workspaceController");
const { retrieveRelevantChunks } = require("../services/retrievalService");
const { generateAnswer } = require("../services/llmService");

async function listMessages(req, res) {
  await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const messages = await ChatMessage.find({ workspace: req.params.workspaceId }).sort({ createdAt: 1 });
  res.json({ messages });
}

async function askQuestion(req, res) {
  const workspace = await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  const userMessage = await ChatMessage.create({
    workspace: workspace._id,
    role: "user",
    content: question.trim(),
  });

  let answer, citations, toolCallLogs;
  try {
    const chunks = await retrieveRelevantChunks(workspace._id, question);
    ({ answer, citations, toolCallLogs } = await generateAnswer(question, chunks, workspace._id));
  } catch (err) {
    const failureMessage = await ChatMessage.create({
      workspace: workspace._id,
      role: "assistant",
      content: "Sorry, I ran into an error trying to answer that. Please try again.",
      citations: [],
    });
    return res.status(502).json({
      error: err.message,
      userMessage,
      assistantMessage: failureMessage,
    });
  }

  const assistantMessage = await ChatMessage.create({
    workspace: workspace._id,
    role: "assistant",
    content: answer,
    citations,
    toolCalls: (toolCallLogs || []).map((log) => log._id),
  });

  res.json({ userMessage, assistantMessage, toolCallLogs: toolCallLogs || [] });
}

module.exports = { listMessages, askQuestion };