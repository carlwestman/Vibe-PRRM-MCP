import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerStrategyTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "get_strategy",
    "Get the current investment strategy document, or a historical version when versionId is set. WARNING: when versionId is set, the response is a StrategyVersion which is missing the updatedAt field that the current Strategy has. Use get_strategy_versions to list available versions.",
    {
      versionId: z.string().optional().describe("If set, return this historical strategy version instead of the current one"),
    },
    async ({ versionId }) => {
      if (versionId !== undefined) {
        const result = await api.get(`/strategy/versions/${versionId}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      const result = await api.get("/strategy");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_strategy_versions",
    "List all versions of the investment strategy document. To fetch a specific version, use get_strategy({versionId}).",
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
      author: z.string().optional().describe("Author of the change"),
    },
    async ({ content, author }) => {
      const result = await api.put("/strategy", { content, author });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
