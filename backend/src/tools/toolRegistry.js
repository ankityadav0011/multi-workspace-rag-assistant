const saveTask = require("./saveTask");
const sendDiscordSummary = require("./sendDiscordSummary");

const tools = [saveTask, sendDiscordSummary];

const toolMap = Object.fromEntries(tools.map((t) => [t.name, t]));

function getFunctionDeclarations() {
  return tools.map(({ name, description, parameters }) => ({ name, description, parameters }));
}

function getTool(name) {
  return toolMap[name];
}

module.exports = { getFunctionDeclarations, getTool };