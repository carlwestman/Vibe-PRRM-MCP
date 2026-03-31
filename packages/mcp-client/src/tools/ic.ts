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

  // ─── Agenda ─────────────────────────────────────────────

  server.tool(
    "add_agenda_item",
    "Add an agenda item to an IC meeting",
    {
      meetingId: z.number().describe("Meeting ID"),
      title: z.string().describe("Agenda item title"),
      description: z.string().optional().describe("Longer description of the agenda item"),
      sortOrder: z.number().optional().describe("Display order (0-based)"),
      links: z.array(z.object({
        entityType: z.string().describe("Linked entity type (instrument, research, valuation)"),
        entityId: z.number().describe("Linked entity ID"),
      })).optional().describe("Links to instruments, research reports, or valuations"),
    },
    async (params) => {
      const result = await api.post(`/ic/meetings/${params.meetingId}/agenda`, params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_agenda_item",
    "Update an existing IC agenda item",
    {
      id: z.string().describe("Agenda item ID"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      sortOrder: z.number().optional().describe("New sort position"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/ic/agenda/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "remove_agenda_item",
    "Remove an agenda item from an IC meeting",
    {
      id: z.string().describe("Agenda item ID"),
    },
    async ({ id }) => {
      const result = await api.delete(`/ic/agenda/${id}`);
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
    "post_preread",
    "Attach a pre-read document to an IC agenda item",
    {
      agendaItemId: z.number().describe("Agenda item ID"),
      title: z.string().describe("Pre-read title"),
      body: z.string().describe("Pre-read content in Markdown"),
      author: z.string().optional().describe("Author (default: PM)"),
    },
    async ({ agendaItemId, title, body, author }) => {
      const result = await api.post("/ic/prereads", { agendaItemId, title, body, author });
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
      meetingId: z.number().describe("Meeting ID where decision was made"),
      text: z.string().describe("Decision text (e.g. 'Buy 50 shares of ASSA ABLOY at market')"),
      assignee: z.string().optional().describe("Person responsible for executing the decision"),
      dueDate: z.string().optional().describe("Due date (YYYY-MM-DD)"),
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
      status: z.enum(["Decided", "In Progress", "Executed", "Reviewed"]).describe("New status"),
      note: z.string().optional().describe("Explanation of the status change"),
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
      status: z.string().optional().describe("Filter by status (Decided, In Progress, Executed, Reviewed)"),
      meetingId: z.number().optional().describe("Filter by meeting ID"),
      assignee: z.string().optional().describe("Filter by assignee"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/ic/decisions", {
        status: params.status,
        meetingId: params.meetingId?.toString(),
        assignee: params.assignee,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
