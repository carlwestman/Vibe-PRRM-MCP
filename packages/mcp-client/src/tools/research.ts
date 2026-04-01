import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerResearchTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "list_research_reports",
    "List research reports with optional filters",
    {
      type: z.string().optional().describe("Report type filter"),
      status: z.string().optional().describe("Report status filter"),
      recommendation: z.string().optional().describe("Filter by recommendation (Buy, Sell, Hold)"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/research", {
        type: params.type,
        status: params.status,
        recommendation: params.recommendation,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_research_report",
    "Get a specific research report by ID",
    {
      id: z.string().describe("Research report ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/research/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_research_report",
    "Create a new research report. IMPORTANT: instrumentId, type, and author cannot be changed after creation — set them correctly here.",
    {
      title: z.string().describe("Report title"),
      type: z.enum(["Instrument Research", "Thematic", "Sector", "Macro", "Ad-Hoc", "Other"]).describe("Report type"),
      instrumentId: z.string().describe("Associated instrument ID — immutable after creation"),
      body: z.string().describe("Report content in markdown"),
      author: z.string().optional().describe("Report author — immutable after creation"),
      recommendation: z.enum(["buy", "hold", "sell", "under_review"]).optional().describe("Investment recommendation"),
      status: z.enum(["draft", "review", "published", "archived"]).optional().describe("Report status (default: draft)"),
    },
    async (params) => {
      const result = await api.post("/research", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_research_report",
    "Update an existing research report. Note: instrumentId, type, and author are immutable — they can only be set at creation time.",
    {
      id: z.string().describe("Report ID to update"),
      title: z.string().optional().describe("Updated title"),
      body: z.string().optional().describe("Updated body content"),
      status: z.string().optional().describe("Updated status: draft, review, published, archived"),
      recommendation: z.string().optional().describe("Updated recommendation: buy, hold, sell, under_review"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/research/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "search_research_semantic",
    "Semantic search across research reports",
    {
      query: z.string().describe("Natural language search query"),
      limit: z.number().optional().describe("Max results to return (1-50, default 10)"),
    },
    async ({ query, limit }) => {
      const result = await api.post("/research/search", { query, limit });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
