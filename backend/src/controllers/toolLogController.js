const ToolCallLog = require("../models/ToolCallLog");
const { assertOwnedWorkspace } = require("./workspaceController");

async function listToolLogs(req, res) {
  await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const logs = await ToolCallLog.find({ workspace: req.params.workspaceId }).sort({ createdAt: -1 });
  res.json({ logs });
}

module.exports = { listToolLogs };