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
    "get_risk_report",
    "Get a specific risk report by ID",
    {
      id: z.string().describe("Risk report ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/risk/reports/${id}`);
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
      date_from: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
    },
    async (params) => {
      const result = await api.get("/risk/reports", {
        type: params.type,
        date_from: params.date_from,
        date_to: params.date_to,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_alert_config",
    "Get the current risk alert trigger configuration",
    {},
    async () => {
      const result = await api.get("/risk/alerts/config");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_risk_alert_trigger",
    "Create a new risk alert trigger",
    {
      metric: z.string().describe("The risk metric to alert on"),
      operator: z.enum(["gt", "gte", "lt", "lte", "eq"]).describe("Comparison operator"),
      threshold: z.number().describe("Threshold value"),
      enabled: z.boolean().optional().describe("Whether the trigger is enabled (default: true)"),
    },
    async (params) => {
      const result = await api.post("/risk/alerts/config", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_risk_alert_trigger",
    "Update an existing risk alert trigger",
    {
      id: z.string().describe("Alert trigger ID"),
      metric: z.string().optional().describe("Updated metric"),
      operator: z.enum(["gt", "gte", "lt", "lte", "eq"]).optional().describe("Updated operator"),
      threshold: z.number().optional().describe("Updated threshold"),
      enabled: z.boolean().optional().describe("Enable or disable the trigger"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/risk/alerts/config/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_risk_alert_trigger",
    "Delete a risk alert trigger",
    {
      id: z.string().describe("Alert trigger ID to delete"),
    },
    async ({ id }) => {
      const result = await api.delete(`/risk/alerts/config/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_risk_alert_events",
    "List risk alert events that have been triggered",
    {},
    async () => {
      const result = await api.get("/risk/alerts/events");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "acknowledge_risk_alert_event",
    "Acknowledge a risk alert event",
    {
      id: z.string().describe("Alert event ID"),
      acknowledged: z.boolean().describe("Set to true to acknowledge"),
      acknowledgedBy: z.string().optional().describe("Person acknowledging the alert"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/risk/alerts/events/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
