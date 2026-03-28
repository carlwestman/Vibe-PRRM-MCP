import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerPortfolioTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "register_trade",
    "Register a new trade in the portfolio",
    {
      instrumentId: z.number().describe("Instrument ID"),
      tradeType: z.enum(["buy", "sell"]).describe("Trade type"),
      shares: z.number().describe("Number of shares"),
      pricePerShare: z.number().describe("Price per share"),
      tradeDate: z.string().describe("Trade date (YYYY-MM-DD)"),
      currency: z.string().describe("Trade currency (e.g. SEK, USD)"),
      fxRate: z.number().optional().describe("FX rate to base currency"),
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
      instrumentId: z.string().describe("Instrument ID"),
    },
    async ({ instrumentId }) => {
      const result = await api.get(`/portfolio/positions/${instrumentId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_trade_history",
    "Get trade history, optionally filtered by instrument",
    {
      instrumentId: z.string().optional().describe("Filter by instrument ID"),
    },
    async (params) => {
      const result = await api.get("/portfolio/trades", {
        instrumentId: params.instrumentId,
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
      group_by: z.string().optional().describe("Group by field (e.g. assetClass, sector, country)"),
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
}
