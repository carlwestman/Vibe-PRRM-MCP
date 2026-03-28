import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerNotificationTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "get_notifications",
    "Get notifications with optional filters",
    {
      unread_only: z.boolean().optional().describe("Only return unread notifications"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/notifications", {
        unread_only: params.unread_only?.toString(),
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_unread_notification_count",
    "Get the count of unread notifications",
    {},
    async () => {
      const result = await api.get("/notifications/unread-count");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "mark_notification_read",
    "Mark a specific notification as read",
    {
      id: z.string().describe("Notification ID"),
    },
    async ({ id }) => {
      const result = await api.patch(`/notifications/${id}/read`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "mark_all_notifications_read",
    "Mark all notifications as read",
    {},
    async () => {
      const result = await api.post("/notifications/mark-all-read");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
