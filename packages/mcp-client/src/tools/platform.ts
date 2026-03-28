import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

const TOOL_CATALOG = [
  { module: "strategy", tools: ["get_strategy", "get_strategy_versions", "get_strategy_version", "update_strategy"] },
  { module: "instruments", tools: ["search_instruments", "get_instrument", "create_instrument", "update_instrument", "add_external_id", "remove_external_id", "search_borsdata_instruments", "search_yahoo_instruments"] },
  { module: "comments", tools: ["get_comments", "add_comment"] },
  { module: "screening", tools: ["list_screening_profiles", "get_screening_profile", "create_screening_profile", "update_screening_profile", "delete_screening_profile", "run_screen", "get_screen_results", "create_instruments_from_screening", "get_available_kpis", "get_screening_classifications", "get_universe", "update_universe_entry"] },
  { module: "research", tools: ["list_research_reports", "get_research_report", "create_research_report", "update_research_report", "search_research_semantic"] },
  { module: "valuation", tools: ["list_valuation_models", "get_valuation_model", "create_valuation_model", "update_valuation_model", "execute_valuation", "get_valuation_output", "list_valuations_by_instrument"] },
  { module: "ic", tools: ["create_ic_meeting", "update_ic_meeting", "list_ic_meetings", "get_ic_meeting", "add_agenda_item", "post_minutes", "update_minutes", "record_decision", "update_decision_status", "list_decisions"] },
  { module: "portfolio", tools: ["register_trade", "get_positions", "get_position", "get_trade_history", "get_portfolio_summary", "get_allocation", "get_fx_exposure"] },
  { module: "performance", tools: ["get_performance_summary", "get_return_series", "get_performance_attribution", "get_drawdown_analysis", "get_benchmark_config", "set_benchmark", "list_performance_reports", "create_performance_report", "get_performance_report"] },
  { module: "risk", tools: ["publish_risk_report", "get_risk_report", "get_risk_dashboard", "list_risk_reports", "get_alert_config", "create_risk_alert_trigger", "update_risk_alert_trigger", "delete_risk_alert_trigger", "list_risk_alert_events", "acknowledge_risk_alert_event"] },
  { module: "notifications", tools: ["get_notifications", "get_unread_notification_count", "mark_notification_read", "mark_all_notifications_read"] },
  { module: "platform", tools: ["global_search", "get_tool_catalog", "trigger_daily_update", "health_check", "get_settings", "update_setting", "get_webhook_config", "update_webhook_config", "test_webhook"] },
];

export function registerPlatformTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "global_search",
    "Search across all PRRM entities (instruments, research, meetings, etc.)",
    {
      q: z.string().describe("Search query"),
      type: z.string().optional().describe("Restrict to entity type (instrument, research, meeting, decision)"),
    },
    async ({ q, type }) => {
      const result = await api.get("/search", { q, type });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_tool_catalog",
    "Get the full catalog of available PRRM MCP tools organized by module",
    {},
    async () => {
      return { content: [{ type: "text", text: JSON.stringify(TOOL_CATALOG) }] };
    }
  );

  server.tool(
    "trigger_daily_update",
    "Trigger the PRRM daily update process (recalculates positions, snapshots portfolio)",
    {},
    async () => {
      const result = await api.post("/daily-update");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "health_check",
    "Check PRRM server health status",
    {},
    async () => {
      const result = await api.get("/health");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_settings",
    "Get PRRM application settings",
    {},
    async () => {
      const result = await api.get("/settings");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_setting",
    "Update a PRRM application setting",
    {
      key: z.string().describe("Setting key"),
      value: z.any().describe("Setting value"),
    },
    async ({ key, value }) => {
      const result = await api.patch("/settings", { key, value });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_webhook_config",
    "Get outbound webhook configuration",
    {},
    async () => {
      const result = await api.get("/webhooks/config");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_webhook_config",
    "Update outbound webhook configuration",
    {
      url: z.string().describe("Webhook URL"),
      enabled: z.boolean().describe("Whether the webhook is enabled"),
      events: z.array(z.string()).describe("Event types to send"),
    },
    async (params) => {
      const result = await api.put("/webhooks/config", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "test_webhook",
    "Send a test webhook to the configured URL",
    {},
    async () => {
      const result = await api.post("/webhooks/test");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
