import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerStrategyTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "get_strategy",
    "Get the current investment strategy document",
    {},
    async () => {
      const result = await api.get("/strategy");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_strategy_versions",
    "Get all versions of the investment strategy document",
    {},
    async () => {
      const result = await api.get("/strategy/versions");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_strategy",
    "Update the investment strategy document with new content",
    {
      content: z.string().describe("The full updated strategy content in markdown"),
      author: z.string().describe("Name of the person making the update"),
    },
    async ({ content, author }) => {
      const result = await api.put("/strategy", { content, author });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
