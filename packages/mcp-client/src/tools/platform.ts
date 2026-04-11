import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerPlatformTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "global_search",
    "Search across all PRRM entities (instruments, research, meetings, etc.)",
    {
      q: z.string().describe("Search query"),
      type: z.string().optional().describe("Restrict to entity type (instrument, research, meeting, decision)"),
    },
    async ({ q, type }) => {
      const result = await api.get("/search", { q, type });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
