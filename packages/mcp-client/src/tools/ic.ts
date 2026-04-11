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
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional().describe("New status"),
      meetingDate: z.string().optional().describe("Updated meeting date (YYYY-MM-DD)"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/ic/meetings/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_ic_meetings",
    "List IC meetings, or fetch one when id is set. Returns an ICMeeting array when listing, or a single ICMeeting object when id is provided. Same shape either way.",
    {
      id: z.string().optional().describe("If set, return this single meeting instead of listing"),
      status: z.string().optional().describe("Filter by meeting status (ignored when id is set)"),
      limit: z.number().optional().describe("Max results (ignored when id is set)"),
      offset: z.number().optional().describe("Pagination offset (ignored when id is set)"),
    },
    async (params) => {
      if (params.id !== undefined) {
        const result = await api.get(`/ic/meetings/${params.id}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      const result = await api.get("/ic/meetings", {
        status: params.status,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Agenda ─────────────────────────────────────────────

  server.tool(
    "add_agenda_item",
    "Add an agenda item to an IC meeting",
    {
      meetingId: z.number().describe("Meeting ID"),
      title: z.string().describe("Agenda item title"),
      instrumentId: z.string().optional().describe("Associated instrument ID (UUID)"),
      presenter: z.string().optional().describe("Name of the person presenting this item"),
      order: z.number().optional().describe("Sequence position in the agenda"),
    },
    async ({ meetingId, ...rest }) => {
      const result = await api.post(`/ic/meetings/${meetingId}/agenda`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_agenda_item",
    "Update an existing IC agenda item",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
      title: z.string().optional().describe("Updated title"),
      description: z.string().optional().describe("Updated description"),
      sortOrder: z.number().optional().describe("Updated sort position"),
    },
    async ({ meetingId, itemId, ...rest }) => {
      const result = await api.patch(`/ic/meetings/${meetingId}/agenda/${itemId}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "remove_agenda_item",
    "Remove an agenda item from an IC meeting",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
    },
    async ({ meetingId, itemId }) => {
      const result = await api.delete(`/ic/meetings/${meetingId}/agenda/${itemId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "reorder_agenda_items",
    "Set the display order for all agenda items in a meeting",
    {
      meetingId: z.number().describe("Meeting ID"),
      orderedIds: z.array(z.number()).describe("Agenda item IDs in desired order"),
    },
    async ({ meetingId, orderedIds }) => {
      const result = await api.post(`/ic/meetings/${meetingId}/agenda/reorder`, { orderedIds });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Pre-reads ──────────────────────────────────────────

  server.tool(
    "list_prereads",
    "List pre-read documents for an IC agenda item, or fetch one when prereadId is set. Returns an ICPreread array when listing, or a single ICPreread object when prereadId is provided. Same shape either way.",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
      prereadId: z.number().optional().describe("If set, return this single pre-read instead of listing"),
    },
    async ({ meetingId, itemId, prereadId }) => {
      if (prereadId !== undefined) {
        const result = await api.get(`/ic/meetings/${meetingId}/agenda/${itemId}/prereads/${prereadId}`);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      }
      const result = await api.get(`/ic/meetings/${meetingId}/agenda/${itemId}/prereads`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "post_preread",
    "Attach a pre-read document to an IC agenda item",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
      title: z.string().describe("Pre-read title"),
      body: z.string().describe("Pre-read content in Markdown"),
      author: z.string().optional().describe("Author (default: PM)"),
    },
    async ({ meetingId, itemId, ...rest }) => {
      const result = await api.post(`/ic/meetings/${meetingId}/agenda/${itemId}/prereads`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_preread",
    "Update a pre-read document",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
      prereadId: z.number().describe("Pre-read ID"),
      title: z.string().optional().describe("Updated title"),
      body: z.string().optional().describe("Updated body content"),
      author: z.string().optional().describe("Updated author"),
    },
    async ({ meetingId, itemId, prereadId, ...rest }) => {
      const result = await api.patch(`/ic/meetings/${meetingId}/agenda/${itemId}/prereads/${prereadId}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_preread",
    "Delete a pre-read document",
    {
      meetingId: z.number().describe("Meeting ID"),
      itemId: z.number().describe("Agenda item ID"),
      prereadId: z.number().describe("Pre-read ID"),
    },
    async ({ meetingId, itemId, prereadId }) => {
      const result = await api.delete(`/ic/meetings/${meetingId}/agenda/${itemId}/prereads/${prereadId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Minutes ────────────────────────────────────────────

  server.tool(
    "post_minutes",
    "Post minutes for an IC meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
      minutes: z.string().describe("Markdown-formatted meeting minutes"),
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
      id: z.string().describe("Minutes record ID"),
      minutes: z.string().describe("Updated Markdown-formatted meeting minutes"),
    },
    async ({ id, minutes }) => {
      const result = await api.patch(`/ic/meetings/${id}/minutes`, { minutes });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Decisions ──────────────────────────────────────────

  server.tool(
    "record_decision",
    "Record a decision from an IC meeting",
    {
      meetingId: z.string().describe("Meeting ID where decision was made"),
      instrumentId: z.string().optional().describe("Instrument ID the decision relates to"),
      decision: z.enum(["approve", "reject", "defer", "modify"]).describe("Decision outcome"),
      rationale: z.string().optional().describe("Reasoning behind the decision"),
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
      status: z.enum(["pending", "executed", "cancelled"]).optional().describe("New status"),
    },
    async ({ id, status }) => {
      const result = await api.patch(`/ic/decisions/${id}`, { status });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_decisions",
    "List IC decisions with optional filters",
    {
      status: z.string().optional().describe("Filter by status (pending, executed, cancelled)"),
      meetingId: z.number().optional().describe("Filter by meeting ID"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/ic/decisions", {
        status: params.status,
        meetingId: params.meetingId?.toString(),
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
