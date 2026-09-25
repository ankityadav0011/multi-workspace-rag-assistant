const fetch = require("node-fetch");

module.exports = {
  name: "send_discord_summary",
  description:
    "Post a short summary or notification message to the team's Discord channel. Use this when the user explicitly asks you to notify the team, post a summary, or share something in Discord.",
  parameters: {
    type: "object",
    properties: {
      message: { type: "string", description: "The summary or notification text to post to Discord" },
    },
    required: ["message"],
  },
  async execute(args) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      const err = new Error("DISCORD_WEBHOOK_URL is not configured on the server");
      err.status = 500;
      throw err;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: args.message }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Discord webhook failed (${res.status}): ${text}`);
    }

    return { posted: true };
  },
};