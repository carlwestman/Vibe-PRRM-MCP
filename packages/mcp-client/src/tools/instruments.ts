import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerInstrumentTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "search_instruments",
    "Search for instruments by name, asset class, status, or sector",
    {
      q: z.string().optional().describe("Search query string"),
      assetClass: z.string().optional().describe("Filter by asset class (e.g. Equity, Fixed Income)"),
      status: z.string().optional().describe("Filter by status (e.g. Active, Inactive, Delisted)"),
      sector: z.string().optional().describe("Filter by sector"),
      limit: z.number().optional().describe("Max results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
    },
    async (params) => {
      const result = await api.get("/instruments", {
        q: params.q,
        assetClass: params.assetClass,
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
      displayName: z.string().describe("Instrument display name"),
      ticker: z.string().optional().describe("Ticker symbol"),
      assetClass: z.string().describe("Asset class (e.g. Equity, Fixed Income, Commodity)"),
      currency: z.string().describe("Currency code (e.g. USD, EUR, SEK)"),
      sector: z.string().optional().describe("Sector classification"),
      country: z.string().optional().describe("Country of domicile"),
      exchange: z.string().optional().describe("Primary exchange"),
      status: z.enum(["Active", "Inactive", "Delisted"]).optional().describe("Instrument status (default: Active)"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
      externalIds: z.array(z.object({
        source: z.string().describe("External data source (e.g. bloomberg, refinitiv)"),
        externalId: z.string().describe("ID in the external system"),
      })).optional().describe("External system identifiers"),
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
      displayName: z.string().optional().describe("Updated display name"),
      ticker: z.string().optional().describe("Updated ticker"),
      assetClass: z.string().optional().describe("Updated asset class"),
      currency: z.string().optional().describe("Updated currency"),
      sector: z.string().optional().describe("Updated sector"),
      country: z.string().optional().describe("Updated country"),
      exchange: z.string().optional().describe("Updated exchange"),
      status: z.enum(["Active", "Inactive", "Delisted"]).optional().describe("Updated status"),
      tags: z.array(z.string()).optional().describe("Updated tags"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/instruments/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "add_external_id",
    "Add an external identifier to an instrument",
    {
      id: z.string().describe("Instrument ID"),
      source: z.string().describe("External data source (e.g. bloomberg, refinitiv, borsdata)"),
      externalId: z.string().describe("ID in the external system"),
    },
    async ({ id, source, externalId }) => {
      const result = await api.post(`/instruments/${id}/external-ids`, { source, externalId });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "remove_external_id",
    "Remove an external identifier from an instrument",
    {
      id: z.string().describe("Instrument ID"),
      extId: z.string().describe("External ID record to remove"),
    },
    async ({ id, extId }) => {
      const result = await api.delete(`/instruments/${id}/external-ids/${extId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "search_borsdata_instruments",
    "Search Borsdata for instruments to import",
    {
      q: z.string().describe("Search query (minimum 2 characters)"),
    },
    async ({ q }) => {
      const result = await api.get("/instruments/import", { q });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "search_yahoo_instruments",
    "Search Yahoo Finance for instruments to import",
    {
      q: z.string().describe("Search query"),
    },
    async ({ q }) => {
      const result = await api.get("/instruments/import-yahoo", { q });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
