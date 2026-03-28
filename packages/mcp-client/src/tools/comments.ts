import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

function entityBasePath(entityType: string, entityId: string): string {
  if (entityType === "research") return `/research/${entityId}/comments`;
  return `/instruments/${entityId}/comments`;
}

export function registerCommentTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "get_comments",
    "Get comments for an instrument or research report",
    {
      entity_type: z.enum(["instrument", "research"]).describe("Type of parent entity"),
      entity_id: z.string().describe("ID of the parent entity"),
    },
    async ({ entity_type, entity_id }) => {
      const result = await api.get(entityBasePath(entity_type, entity_id));
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "add_comment",
    "Add a comment to an instrument or research report",
    {
      entity_type: z.enum(["instrument", "research"]).describe("Type of parent entity"),
      entity_id: z.string().describe("ID of the parent entity"),
      body: z.string().describe("Comment text"),
      author: z.string().optional().describe("Name of the commenter"),
    },
    async ({ entity_type, entity_id, body, author }) => {
      const result = await api.post(entityBasePath(entity_type, entity_id), { body, author });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
