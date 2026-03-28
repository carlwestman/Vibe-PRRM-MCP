import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerIcTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "create_ic_meeting",
    "Create a new investment committee meeting",
    {
      meeting_date: z.string().describe("Meeting date in ISO format (YYYY-MM-DD or full ISO)"),
    },
    async ({ meeting_date }) => {
      const result = await api.post("/ic/meetings", { meetingDate: meeting_date });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_meeting_status",
    "Update the status of an IC meeting (e.g. scheduled, in_progress, completed)",
    {
      id: z.string().describe("Meeting ID"),
      status: z.string().describe("New status (scheduled, in_progress, completed, cancelled)"),
    },
    async ({ id, status }) => {
      const result = await api.patch(`/ic/meetings/${id}`, { status });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_ic_meetings",
    "List investment committee meetings with optional filters",
    {
      status: z.string().optional().describe("Filter by meeting status"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/ic/meetings", {
        status: params.status,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
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
      type: z.string().optional().describe("Item type (e.g. new_position, review, risk)"),
      instrument_id: z.string().optional().describe("Associated instrument ID"),
      research_id: z.string().optional().describe("Associated research report ID"),
      presenter: z.string().optional().describe("Who will present this item"),
      notes: z.string().optional().describe("Additional notes"),
    },
    async ({ meeting_id, ...rest }) => {
      const result = await api.post(`/ic/meetings/${meeting_id}/agenda`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_agenda_item",
    "Update an agenda item on an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      id: z.string().describe("Agenda item ID"),
      title: z.string().optional().describe("Updated title"),
      type: z.string().optional().describe("Updated type"),
      presenter: z.string().optional().describe("Updated presenter"),
      notes: z.string().optional().describe("Updated notes"),
      decision: z.string().optional().describe("Decision recorded for this item"),
    },
    async ({ meeting_id, ...rest }) => {
      const result = await api.patch(`/ic/meetings/${meeting_id}/agenda`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "remove_agenda_item",
    "Remove an agenda item from an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      id: z.string().describe("Agenda item ID to remove"),
    },
    async ({ meeting_id, id }) => {
      const result = await api.delete(`/ic/meetings/${meeting_id}/agenda/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "reorder_agenda_items",
    "Reorder agenda items on an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      ordered_ids: z.array(z.string()).describe("Agenda item IDs in desired order"),
    },
    async ({ meeting_id, ordered_ids }) => {
      const result = await api.put(`/ic/meetings/${meeting_id}/agenda/reorder`, { ordered_ids });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "post_preread",
    "Upload a pre-read document for an agenda item",
    {
      agenda_item_id: z.string().describe("Agenda item ID"),
      title: z.string().describe("Pre-read title"),
      content: z.string().describe("Pre-read content in markdown"),
      author: z.string().describe("Author of the pre-read"),
    },
    async ({ agenda_item_id, ...rest }) => {
      const result = await api.post(`/ic/agenda/${agenda_item_id}/prereads`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "post_minutes",
    "Post minutes for an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      body: z.string().describe("Minutes content in markdown"),
      author: z.string().describe("Author of the minutes"),
    },
    async ({ meeting_id, body, author }) => {
      const result = await api.post(`/ic/meetings/${meeting_id}/minutes`, { body, author });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_minutes",
    "Update existing minutes for an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      id: z.string().describe("Minutes record ID"),
      body: z.string().describe("Updated minutes content"),
    },
    async ({ meeting_id, id, body }) => {
      const result = await api.patch(`/ic/meetings/${meeting_id}/minutes`, { id, body });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_decision",
    "Record a decision from an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID where decision was made"),
      text: z.string().describe("Decision text"),
      assignee: z.string().optional().describe("Person assigned to execute the decision"),
      due_date: z.string().optional().describe("Due date for the decision action (ISO format)"),
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
      status: z.string().describe("New status (pending, in_progress, completed, cancelled)"),
      note: z.string().optional().describe("Optional note about the status change"),
    },
    async ({ id, status, note }) => {
      const result = await api.patch(`/ic/decisions/${id}`, { status, note });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_decisions",
    "List IC decisions with optional filters",
    {
      status: z.string().optional().describe("Filter by decision status"),
      meeting_id: z.string().optional().describe("Filter by meeting ID"),
      assignee: z.string().optional().describe("Filter by assignee"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/ic/decisions", {
        status: params.status,
        meeting_id: params.meeting_id,
        assignee: params.assignee,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
