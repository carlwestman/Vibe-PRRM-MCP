import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerIcTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "create_ic_meeting",
    "Create a new investment committee meeting",
    {
      meetingDate: z.string().describe("Meeting date (YYYY-MM-DD)"),
    },
    async ({ meetingDate }) => {
      const result = await api.post("/ic/meetings", { meetingDate });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_ic_meeting",
    "Update an IC meeting (status and/or date)",
    {
      id: z.string().describe("Meeting ID"),
      status: z.string().optional().describe("New status"),
      meetingDate: z.string().optional().describe("Updated meeting date (YYYY-MM-DD)"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/ic/meetings/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_ic_meetings",
    "List investment committee meetings",
    {},
    async () => {
      const result = await api.get("/ic/meetings");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_ic_meeting",
    "Get detailed information about a specific IC meeting",
    {
      id: z.string().describe("Meeting ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/ic/meetings/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "add_agenda_item",
    "Add an agenda item to an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      title: z.string().describe("Agenda item title"),
      instrumentId: z.number().optional().describe("Associated instrument ID"),
      presenter: z.string().optional().describe("Who will present this item"),
      order: z.number().optional().describe("Display order"),
    },
    async ({ meeting_id, ...rest }) => {
      const result = await api.post(`/ic/meetings/${meeting_id}/agenda`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "post_minutes",
    "Post minutes for an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      minutes: z.string().describe("Minutes content in markdown"),
    },
    async ({ meeting_id, minutes }) => {
      const result = await api.post(`/ic/meetings/${meeting_id}/minutes`, { minutes });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_minutes",
    "Update existing minutes for an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      minutes: z.string().describe("Updated minutes content"),
    },
    async ({ meeting_id, minutes }) => {
      const result = await api.patch(`/ic/meetings/${meeting_id}/minutes`, { minutes });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_decision",
    "Record a decision from an IC meeting",
    {
      meetingId: z.number().describe("Meeting ID where decision was made"),
      decision: z.enum(["approve", "reject", "defer", "modify"]).describe("Decision outcome"),
      instrumentId: z.number().optional().describe("Related instrument ID"),
      rationale: z.string().optional().describe("Rationale for the decision"),
      author: z.string().optional().describe("Person recording the decision"),
    },
    async (params) => {
      const result = await api.post("/ic/decisions", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_decision_status",
    "Update the status of an IC decision",
    {
      id: z.string().describe("Decision ID"),
      status: z.enum(["pending", "executed", "cancelled"]).describe("New status"),
    },
    async ({ id, status }) => {
      const result = await api.patch(`/ic/decisions/${id}`, { status });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_decisions",
    "List IC decisions",
    {},
    async () => {
      const result = await api.get("/ic/decisions");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
