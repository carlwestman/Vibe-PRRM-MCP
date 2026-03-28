import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerPerformanceTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "get_performance_summary",
    "Get portfolio performance summary for a given period",
    {
      period: z.enum(["wtd", "mtd", "qtd", "ytd", "custom"]).describe("Time period"),
      date_from: z.string().optional().describe("Start date for custom period (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date for custom period (YYYY-MM-DD)"),
      as_of_date: z.string().optional().describe("As-of date (YYYY-MM-DD)"),
    },
    async (params) => {
      const result = await api.get("/performance/summary", {
        period: params.period,
        date_from: params.date_from,
        date_to: params.date_to,
        as_of_date: params.as_of_date,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_return_series",
    "Get portfolio and benchmark return time series",
    {
      date_from: z.string().describe("Start date (YYYY-MM-DD)"),
      date_to: z.string().describe("End date (YYYY-MM-DD)"),
      interval: z.enum(["daily", "weekly", "monthly"]).describe("Return interval"),
    },
    async (params) => {
      const result = await api.get("/performance/returns", {
        date_from: params.date_from,
        date_to: params.date_to,
        interval: params.interval,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_performance_attribution",
    "Get performance attribution analysis by position, sector, or currency",
    {
      date_from: z.string().describe("Start date (YYYY-MM-DD)"),
      date_to: z.string().describe("End date (YYYY-MM-DD)"),
      group_by: z.enum(["position", "sector", "currency"]).describe("Attribution grouping"),
    },
    async (params) => {
      const result = await api.get("/performance/attribution", {
        date_from: params.date_from,
        date_to: params.date_to,
        group_by: params.group_by,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_drawdown_analysis",
    "Get portfolio drawdown analysis including current and maximum drawdowns",
    {
      date_from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async (params) => {
      const result = await api.get("/performance/drawdown", {
        date_from: params.date_from,
        date_to: params.date_to,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_benchmark_config",
    "Get the current benchmark configuration",
    {},
    async () => {
      const result = await api.get("/performance/benchmark");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "set_benchmark",
    "Set a benchmark instrument for performance comparison",
    {
      name: z.string().describe("Benchmark name"),
      instrumentId: z.number().describe("Instrument ID to use as benchmark"),
    },
    async (params) => {
      const result = await api.post("/performance/benchmark", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_performance_reports",
    "List performance reports with optional filters",
    {
      period: z.enum(["weekly", "monthly", "quarterly", "annual", "ad_hoc"]).optional().describe("Filter by report period"),
      date_from: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
      limit: z.number().optional().describe("Max results (default 50)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/performance/reports", {
        period: params.period,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_performance_report",
    "Create a new performance report",
    {
      reportDate: z.string().describe("Report date (YYYY-MM-DD)"),
      period: z.enum(["weekly", "monthly", "quarterly", "annual", "ad_hoc"]).describe("Report period"),
      periodStart: z.string().describe("Period start date (YYYY-MM-DD)"),
      periodEnd: z.string().describe("Period end date (YYYY-MM-DD)"),
      author: z.string().describe("Report author"),
      body: z.string().describe("Report content in markdown"),
      metricsSnapshot: z.record(z.any()).optional().describe("Snapshot of key metrics"),
    },
    async (params) => {
      const result = await api.post("/performance/reports", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_performance_report",
    "Get a specific performance report by ID",
    {
      id: z.string().describe("Performance report ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/performance/reports/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
