const Task = require("../models/Task");

module.exports = {
  name: "save_task",
  description:
    "Save a task or to-do item into the current workspace. Use this when the user explicitly asks to add, save, create, or remember a task/to-do — not for general questions about documents.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short title of the task" },
      description: { type: "string", description: "Optional longer description of the task" },
    },
    required: ["title"],
  },
  async execute(args, { workspaceId }) {
    const task = await Task.create({
      workspace: workspaceId,
      title: args.title,
      description: args.description || "",
    });
    return { taskId: task._id.toString(), title: task.title, saved: true };
  },
};