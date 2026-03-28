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
      instrument_id: z.string().optional().describe("Filter by instrument ID"),
      author: z.string().optional().describe("Filter by author"),
      recommendation: z.string().optional().describe("Filter by recommendation (buy, sell, hold)"),
      conviction: z.string().optional().describe("Filter by conviction level"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/research", {
        type: params.type,
        status: params.status,
        instrument_id: params.instrument_id,
        author: params.author,
        recommendation: params.recommendation,
        conviction: params.conviction,
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
    "Create a new research report",
    {
      title: z.string().describe("Report title"),
      type: z.string().describe("Report type (e.g. initiation, update, note)"),
      instrument_id: z.string().optional().describe("Associated instrument ID"),
      author: z.string().describe("Report author"),
      body: z.string().describe("Report content in markdown"),
      recommendation: z.string().optional().describe("Investment recommendation (buy, sell, hold)"),
      conviction: z.string().optional().describe("Conviction level (high, medium, low)"),
      target_price: z.number().optional().describe("Target price"),
    },
    async (params) => {
      const result = await api.post("/research", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_research_report",
    "Update an existing research report",
    {
      id: z.string().describe("Report ID to update"),
      title: z.string().optional().describe("Updated title"),
      body: z.string().optional().describe("Updated body content"),
      status: z.string().optional().describe("Updated status"),
      recommendation: z.string().optional().describe("Updated recommendation"),
      conviction: z.string().optional().describe("Updated conviction"),
      target_price: z.number().optional().describe("Updated target price"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/research/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "link_valuation_to_research",
    "Link a valuation output to a research report",
    {
      report_id: z.string().describe("Research report ID"),
      valuation_output_id: z.string().describe("Valuation output ID to link"),
    },
    async ({ report_id, valuation_output_id }) => {
      const result = await api.post(`/research/${report_id}/link-valuation`, {
        valuation_output_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "search_research_semantic",
    "Semantic search across research reports",
    {
      query: z.string().describe("Natural language search query"),
      limit: z.number().optional().describe("Max results to return"),
    },
    async ({ query, limit }) => {
      const result = await api.post("/research/search", { query, limit });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
