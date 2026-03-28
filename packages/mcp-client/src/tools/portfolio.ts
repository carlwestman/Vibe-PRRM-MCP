import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerPortfolioTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "register_trade",
    "Register a new trade in the portfolio",
    {
      instrument_id: z.string().describe("Instrument ID"),
      side: z.enum(["buy", "sell"]).describe("Trade side"),
      quantity: z.number().describe("Number of units"),
      price: z.number().describe("Execution price per unit"),
      currency: z.string().optional().describe("Trade currency"),
      trade_date: z.string().optional().describe("Trade date (ISO format, defaults to today)"),
      settlement_date: z.string().optional().describe("Settlement date (ISO format)"),
      broker: z.string().optional().describe("Broker name"),
      notes: z.string().optional().describe("Trade notes"),
    },
    async (params) => {
      const result = await api.post("/portfolio/trades", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_positions",
    "Get all current portfolio positions",
    {},
    async () => {
      const result = await api.get("/portfolio/positions");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_position",
    "Get position details for a specific instrument",
    {
      instrument_id: z.string().describe("Instrument ID"),
    },
    async ({ instrument_id }) => {
      const result = await api.get(`/portfolio/positions/${instrument_id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_trade_history",
    "Get trade history, optionally filtered by instrument",
    {
      instrument_id: z.string().optional().describe("Filter by instrument ID"),
    },
    async (params) => {
      const result = await api.get("/portfolio/trades", {
        instrument_id: params.instrument_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_portfolio_summary",
    "Get a high-level portfolio summary including NAV, returns, and key metrics",
    {},
    async () => {
      const result = await api.get("/portfolio/summary");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_allocation",
    "Get portfolio allocation breakdown",
    {
      group_by: z.string().optional().describe("Group by field (e.g. asset_class, sector, country)"),
    },
    async ({ group_by }) => {
      const result = await api.get("/portfolio/allocation", { group_by });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_fx_exposure",
    "Get portfolio foreign exchange exposure breakdown",
    {},
    async () => {
      const result = await api.get("/portfolio/fx-exposure");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "recalculate_positions",
    "Trigger recalculation of all portfolio positions from trade history",
    {},
    async () => {
      const result = await api.post("/daily-update");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "snapshot_portfolio",
    "Trigger a portfolio snapshot as part of the daily update process",
    {},
    async () => {
      const result = await api.post("/daily-update");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
