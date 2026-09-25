const Task = require("../models/Task");
const { assertOwnedWorkspace } = require("./workspaceController");

async function listTasks(req, res) {
  await assertOwnedWorkspace(req.params.workspaceId, req.userId);
  const tasks = await Task.find({ workspace: req.params.workspaceId }).sort({ createdAt: -1 });
  res.json({ tasks });
}

module.exports = { listTasks };