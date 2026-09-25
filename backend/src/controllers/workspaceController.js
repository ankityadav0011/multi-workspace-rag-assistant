const Workspace = require("../models/Workspace");

async function listWorkspaces(req, res) {
  const workspaces = await Workspace.find({ owner: req.userId }).sort({ createdAt: 1 });
  res.json({ workspaces });
}

async function createWorkspace(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Workspace name is required" });
  }
  const workspace = await Workspace.create({ name: name.trim(), owner: req.userId });
  res.status(201).json({ workspace });
}

// Shared helper other controllers use to make sure the workspace in the URL
// actually belongs to the logged-in user before touching any of its data.
// This is the first line of defense for tenant isolation, before the vector filter.
async function assertOwnedWorkspace(workspaceId, userId) {
  const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
  if (!workspace) {
    const err = new Error("Workspace not found or access denied");
    err.status = 404;
    throw err;
  }
  return workspace;
}

module.exports = { listWorkspaces, createWorkspace, assertOwnedWorkspace };
