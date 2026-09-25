const ToolCallLog = require("../models/ToolCallLog");
const { getTool } = require("../tools/toolRegistry");

function validateArgs(schema, args) {
  const errors = [];
  if (args === null || typeof args !== "object" || Array.isArray(args)) {
    return ["Arguments must be an object"];
  }

  for (const key of schema.required || []) {
    if (!(key in args)) errors.push(`Missing required argument: "${key}"`);
  }

  for (const [key, value] of Object.entries(args)) {
    const propSchema = schema.properties?.[key];
    if (!propSchema) {
      errors.push(`Unknown argument: "${key}"`);
      continue;
    }
    if (propSchema.type === "string" && typeof value !== "string") {
      errors.push(`Argument "${key}" must be a string`);
    }
  }

  return errors;
}

async function validateAndExecuteTool(toolName, args, workspaceId) {
  const tool = getTool(toolName);

  if (!tool) {
    const log = await ToolCallLog.create({
      workspace: workspaceId,
      toolName,
      args,
      status: "rejected",
      error: `Unknown tool: "${toolName}"`,
    });
    return { result: { error: `Unknown tool "${toolName}"` }, log };
  }

  const errors = validateArgs(tool.parameters, args || {});
  if (errors.length > 0) {
    const log = await ToolCallLog.create({
      workspace: workspaceId,
      toolName,
      args,
      status: "rejected",
      error: errors.join("; "),
    });
    return { result: { error: errors.join("; ") }, log };
  }

  try {
    const result = await tool.execute(args, { workspaceId });
    const log = await ToolCallLog.create({
      workspace: workspaceId,
      toolName,
      args,
      status: "success",
      result,
    });
    return { result, log };
  } catch (err) {
    const log = await ToolCallLog.create({
      workspace: workspaceId,
      toolName,
      args,
      status: "error",
      error: err.message,
    });
    return { result: { error: err.message }, log };
  }
}

module.exports = { validateAndExecuteTool };