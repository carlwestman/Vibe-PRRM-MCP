import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerPortfolioTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "register_trade",
    "Register a new trade in the portfolio",
    {
      instrumentId: z.string().describe("Instrument ID"),
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

  server.tool(
    "update_trade",
    "Update an existing trade",
    {
      id: z.string().describe("Trade ID"),
      instrumentId: z.number().optional().describe("Updated instrument ID"),
      shares: z.number().optional().describe("Updated number of shares"),
      pricePerShare: z.number().optional().describe("Updated price per share"),
      fxRate: z.number().optional().describe("Updated FX rate"),
      notes: z.string().optional().describe("Updated notes"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/portfolio/trades/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_trade",
    "Delete a trade from the portfolio",
    {
      id: z.string().describe("Trade ID to delete"),
    },
    async ({ id }) => {
      const result = await api.delete(`/portfolio/trades/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Cash management ────────────────────────────────────

  server.tool(
    "get_cash_balances",
    "Get cash balances across currencies",
    {
      sub_portfolio_id: z.number().optional().describe("Filter by sub-portfolio ID"),
    },
    async (params) => {
      const result = await api.get("/portfolio/cash", {
        sub_portfolio_id: params.sub_portfolio_id?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_deposit",
    "Record a cash deposit",
    {
      amount: z.number().describe("Deposit amount"),
      currency: z.string().describe("Currency code (e.g. SEK, USD)"),
      date: z.string().describe("Deposit date (YYYY-MM-DD)"),
      fxRate: z.number().optional().describe("FX rate to base currency (default: 1)"),
      subPortfolioId: z.number().optional().describe("Target sub-portfolio ID"),
      notes: z.string().optional().describe("Notes"),
    },
    async (params) => {
      const result = await api.post("/portfolio/cash/deposit", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_cash_transactions",
    "List cash transactions with optional filters",
    {
      sub_portfolio_id: z.number().optional().describe("Filter by sub-portfolio"),
      currency: z.string().optional().describe("Filter by currency"),
      type: z.string().optional().describe("Filter by transaction type"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/portfolio/cash/transactions", {
        sub_portfolio_id: params.sub_portfolio_id?.toString(),
        currency: params.currency,
        type: params.type,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_withdrawal",
    "Record a cash withdrawal (amount is positive — API negates it)",
    {
      amount: z.number().describe("Withdrawal amount (positive)"),
      currency: z.string().describe("Currency code (e.g. SEK, USD)"),
      date: z.string().describe("Withdrawal date (YYYY-MM-DD)"),
      fxRate: z.number().optional().describe("FX rate to base currency (default: 1)"),
      subPortfolioId: z.number().optional().describe("Source sub-portfolio ID"),
      notes: z.string().optional().describe("Notes"),
    },
    async (params) => {
      const result = await api.post("/portfolio/cash/withdraw", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Portfolio config ───────────────────────────────────

  server.tool(
    "get_portfolio_config",
    "Get portfolio configuration (base currency, etc.)",
    {},
    async () => {
      const result = await api.get("/portfolio/config");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_portfolio_config",
    "Update portfolio configuration",
    {
      name: z.string().optional().describe("Portfolio name"),
      baseCurrency: z.string().optional().describe("Base currency code (e.g. SEK)"),
      marginLimit: z.number().optional().describe("Margin limit"),
    },
    async (params) => {
      const result = await api.patch("/portfolio/config", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Dividends ──────────────────────────────────────────

  server.tool(
    "get_dividends",
    "List dividends with optional filters",
    {
      view: z.string().optional().describe("View type"),
      instrument_id: z.number().optional().describe("Filter by instrument"),
      year: z.number().optional().describe("Filter by year"),
    },
    async (params) => {
      const result = await api.get("/portfolio/dividends", {
        view: params.view,
        instrument_id: params.instrument_id?.toString(),
        year: params.year?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_dividend",
    "Record a dividend payment",
    {
      instrumentId: z.number().describe("Instrument ID"),
      exDate: z.string().describe("Ex-dividend date (YYYY-MM-DD)"),
      amountPerShare: z.number().describe("Dividend amount per share"),
      currency: z.string().describe("Dividend currency"),
      payDate: z.string().optional().describe("Payment date (YYYY-MM-DD)"),
      fxRate: z.number().optional().describe("FX rate to base currency"),
      subPortfolioId: z.number().optional().describe("Sub-portfolio ID"),
      notes: z.string().optional().describe("Notes"),
    },
    async (params) => {
      const result = await api.post("/portfolio/dividends", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "sync_dividends",
    "Sync dividends from Borsdata for all holdings",
    {},
    async () => {
      const result = await api.post("/portfolio/dividends/sync");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Import sessions ───────────────────────────────────

  server.tool(
    "create_import_session",
    "Create a new trade import session (for CSV/broker imports)",
    {},
    async () => {
      const result = await api.post("/portfolio/import/sessions");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_import_session",
    "Get an import session with its parsed rows",
    {
      id: z.string().describe("Import session ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/portfolio/import/sessions/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "cancel_import_session",
    "Cancel an import session and discard its data",
    {
      id: z.string().describe("Import session ID"),
    },
    async ({ id }) => {
      const result = await api.delete(`/portfolio/import/sessions/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "commit_import_session",
    "Commit an import session, creating trades from its rows",
    {
      id: z.string().describe("Import session ID"),
    },
    async ({ id }) => {
      const result = await api.post(`/portfolio/import/sessions/${id}/commit`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_import_row",
    "Update a row in an import session (fix mapping, amounts, etc.)",
    {
      id: z.string().describe("Import session ID"),
      rowId: z.string().describe("Row ID within the session"),
      data: z.record(z.any()).optional().describe("Fields to update on the row"),
    },
    async ({ id, rowId, data }) => {
      const result = await api.patch(`/portfolio/import/sessions/${id}/rows/${rowId}`, data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Analytics ──────────────────────────────────────────

  server.tool(
    "get_margin_summary",
    "Get margin utilization summary",
    {},
    async () => {
      const result = await api.get("/portfolio/margin");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_realised_pnl",
    "Get realized P&L summary from closed positions",
    {
      sub_portfolio_id: z.number().optional().describe("Filter by sub-portfolio"),
      date_from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async (params) => {
      const result = await api.get("/portfolio/realised-pnl", {
        sub_portfolio_id: params.sub_portfolio_id?.toString(),
        date_from: params.date_from,
        date_to: params.date_to,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Sub-portfolios ─────────────────────────────────────

  server.tool(
    "list_sub_portfolios",
    "List all sub-portfolios (sleeves)",
    {},
    async () => {
      const result = await api.get("/portfolio/sub-portfolios");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_sub_portfolio",
    "Create a new sub-portfolio (sleeve)",
    {
      name: z.string().describe("Sub-portfolio name"),
      description: z.string().optional().describe("Description"),
    },
    async (params) => {
      const result = await api.post("/portfolio/sub-portfolios", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── New portfolio tools ───────────────────────────────

  server.tool(
    "update_position_price",
    "Update the price on a portfolio position",
    {
      instrumentId: z.string().describe("Instrument ID"),
      price: z.number().describe("Updated price"),
      priceDate: z.string().optional().describe("Price date (YYYY-MM-DD)"),
    },
    async ({ instrumentId, ...rest }) => {
      const result = await api.patch(`/portfolio/positions/${instrumentId}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "assign_position_sleeve",
    "Assign a position to a sub-portfolio sleeve",
    {
      instrumentId: z.string().describe("Instrument ID"),
      subPortfolioId: z.number().optional().describe("Sub-portfolio ID (omit to unassign)"),
    },
    async ({ instrumentId, subPortfolioId }) => {
      const result = await api.patch(`/portfolio/positions/${instrumentId}/sleeve`, { subPortfolioId });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "import_portfolio",
    "Import portfolio data (CSV/broker file upload)",
    {
      data: z.any().describe("Import payload — passed through to the API"),
    },
    async ({ data }) => {
      const result = await api.post("/portfolio/import", data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "import_transactions",
    "Import transactions from an external source",
    {
      data: z.any().describe("Transaction import payload — passed through to the API"),
      dry_run: z.boolean().optional().describe("If true, validate without committing"),
      sub_portfolio_id: z.number().optional().describe("Target sub-portfolio ID"),
    },
    async ({ data, dry_run, sub_portfolio_id }) => {
      const result = await api.post("/portfolio/import/transactions", data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_cash_transaction",
    "Update a cash transaction",
    {
      id: z.string().describe("Cash transaction ID"),
      type: z.enum(["deposit", "withdrawal", "margin_draw", "margin_repay"]).optional().describe("Transaction type"),
      amount: z.number().optional().describe("Updated amount"),
      currency: z.string().optional().describe("Updated currency"),
      fxRate: z.number().optional().describe("Updated FX rate"),
      date: z.string().optional().describe("Updated date (YYYY-MM-DD)"),
      notes: z.string().optional().describe("Updated notes"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/portfolio/cash/transactions/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_cash_transaction",
    "Delete a cash transaction",
    {
      id: z.string().describe("Cash transaction ID to delete"),
    },
    async ({ id }) => {
      const result = await api.delete(`/portfolio/cash/transactions/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_sub_portfolio_summary",
    "Get summary metrics for all sub-portfolios",
    {},
    async () => {
      const result = await api.get("/portfolio/sub-portfolios/summary");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_sub_portfolio",
    "Get a specific sub-portfolio by ID",
    {
      id: z.string().describe("Sub-portfolio ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/portfolio/sub-portfolios/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_sub_portfolio",
    "Update a sub-portfolio",
    {
      id: z.string().describe("Sub-portfolio ID"),
      name: z.string().optional().describe("Updated name"),
      description: z.string().optional().describe("Updated description"),
      sortOrder: z.number().optional().describe("Updated sort order"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/portfolio/sub-portfolios/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_sub_portfolio",
    "Delete a sub-portfolio",
    {
      id: z.string().describe("Sub-portfolio ID to delete"),
    },
    async ({ id }) => {
      const result = await api.delete(`/portfolio/sub-portfolios/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
