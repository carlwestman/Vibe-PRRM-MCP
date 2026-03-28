import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerInstrumentTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "search_instruments",
    "Search for instruments by name, asset class, status, or sector",
    {
      q: z.string().optional().describe("Search query string"),
      asset_class: z.string().optional().describe("Filter by asset class (e.g. equity, fixed_income)"),
      status: z.string().optional().describe("Filter by status (e.g. active, watchlist, excluded)"),
      sector: z.string().optional().describe("Filter by sector"),
      limit: z.number().optional().describe("Max results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async (params) => {
      const result = await api.get("/instruments", {
        q: params.q,
        asset_class: params.asset_class,
        status: params.status,
        sector: params.sector,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_instrument",
    "Get detailed information about a specific instrument by ID",
    {
      id: z.string().describe("The instrument ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/instruments/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_instrument",
    "Create a new instrument in the system",
    {
      name: z.string().describe("Instrument name"),
      ticker: z.string().optional().describe("Ticker symbol"),
      isin: z.string().optional().describe("ISIN code"),
      asset_class: z.string().describe("Asset class (e.g. equity, fixed_income, commodity)"),
      currency: z.string().optional().describe("Currency code (e.g. USD, EUR)"),
      sector: z.string().optional().describe("Sector classification"),
      country: z.string().optional().describe("Country of domicile"),
      exchange: z.string().optional().describe("Primary exchange"),
    },
    async (params) => {
      const result = await api.post("/instruments", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_instrument",
    "Update fields on an existing instrument",
    {
      id: z.string().describe("The instrument ID to update"),
      name: z.string().optional().describe("Updated name"),
      ticker: z.string().optional().describe("Updated ticker"),
      isin: z.string().optional().describe("Updated ISIN"),
      asset_class: z.string().optional().describe("Updated asset class"),
      currency: z.string().optional().describe("Updated currency"),
      sector: z.string().optional().describe("Updated sector"),
      country: z.string().optional().describe("Updated country"),
      exchange: z.string().optional().describe("Updated exchange"),
      status: z.string().optional().describe("Updated status"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/instruments/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
