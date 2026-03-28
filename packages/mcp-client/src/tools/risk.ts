import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerRiskTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "publish_risk_report",
    "Publish a new risk report",
    {
      type: z.string().describe("Report type (e.g. daily, weekly, adhoc)"),
      title: z.string().describe("Report title"),
      body: z.string().describe("Report content in markdown"),
      metrics: z.record(z.any()).optional().describe("Key risk metrics as key-value pairs"),
      author: z.string().describe("Report author"),
    },
    async (params) => {
      const result = await api.post("/risk/reports", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_risk_dashboard",
    "Get the current risk dashboard with key metrics and alerts",
    {},
    async () => {
      const result = await api.get("/risk/dashboard");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_risk_reports",
    "List risk reports with optional filters",
    {
      type: z.string().optional().describe("Filter by report type"),
      date_from: z.string().optional().describe("Start date filter (ISO format)"),
      date_to: z.string().optional().describe("End date filter (ISO format)"),
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/risk/reports", {
        type: params.type,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_alert_config",
    "Get the current risk alert configuration",
    {},
    async () => {
      const result = await api.get("/risk/alerts/config");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "suggest_alert_change",
    "Suggest a change to risk alert thresholds",
    {
      metric: z.string().describe("The risk metric to alert on"),
      condition: z.string().describe("Alert condition (e.g. gt, lt, crosses)"),
      threshold: z.number().describe("Threshold value"),
      severity: z.string().describe("Alert severity (info, warning, critical)"),
    },
    async (params) => {
      const result = await api.post("/risk/alerts/config", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "record_alert_event",
    "Record a risk alert event when a threshold is breached",
    {
      trigger_id: z.string().describe("Alert trigger ID"),
      metric_value: z.number().describe("The metric value that triggered the alert"),
    },
    async (params) => {
      const result = await api.post("/risk/alerts/events", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_risk_decomposition",
    "Get portfolio risk decomposition (factor exposures, contribution to risk)",
    {},
    async () => {
      const result = await api.get("/risk/decomposition");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_holdings_for_optimizer",
    "Get current holdings in a format suitable for portfolio optimization",
    {},
    async () => {
      const result = await api.get("/risk/holdings-for-optimizer");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
