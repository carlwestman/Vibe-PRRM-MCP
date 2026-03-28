import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

const TOOL_CATALOG = [
  { module: "strategy", tools: ["get_strategy", "get_strategy_versions", "update_strategy"] },
  { module: "instruments", tools: ["search_instruments", "get_instrument", "create_instrument", "update_instrument"] },
  { module: "comments", tools: ["get_comments", "add_comment"] },
  { module: "screening", tools: ["list_screening_profiles", "get_screening_profile", "create_screening_profile", "update_screening_profile", "run_screen", "get_screen_results", "get_available_kpis", "get_screening_classifications", "get_universe"] },
  { module: "research", tools: ["list_research_reports", "get_research_report", "create_research_report", "update_research_report", "link_valuation_to_research", "search_research_semantic"] },
  { module: "valuation", tools: ["list_valuation_models", "get_valuation_model", "create_valuation_model", "update_valuation_model", "execute_valuation", "get_valuation_output", "list_valuations_by_instrument", "link_valuation_to_report"] },
  { module: "ic", tools: ["create_ic_meeting", "update_meeting_status", "list_ic_meetings", "get_ic_meeting", "add_agenda_item", "update_agenda_item", "remove_agenda_item", "reorder_agenda_items", "post_preread", "post_minutes", "update_minutes", "record_decision", "update_decision_status", "list_decisions"] },
  { module: "portfolio", tools: ["register_trade", "get_positions", "get_position", "get_trade_history", "get_portfolio_summary", "get_allocation", "get_fx_exposure", "recalculate_positions", "snapshot_portfolio"] },
  { module: "risk", tools: ["publish_risk_report", "get_risk_dashboard", "list_risk_reports", "get_alert_config", "suggest_alert_change", "record_alert_event", "get_risk_decomposition", "get_holdings_for_optimizer"] },
  { module: "notifications", tools: ["get_notifications", "get_unread_notification_count"] },
  { module: "platform", tools: ["global_search", "get_tool_catalog", "trigger_daily_update"] },
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
}
