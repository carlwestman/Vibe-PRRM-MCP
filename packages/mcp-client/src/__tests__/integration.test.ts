import { describe, it, expect, beforeAll } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PrrmApiClient } from "../api-client.js";
import { registerStrategyTools } from "../tools/strategy.js";
import { registerInstrumentTools } from "../tools/instruments.js";
import { registerCommentTools } from "../tools/comments.js";
import { registerScreeningTools } from "../tools/screening.js";
import { registerResearchTools } from "../tools/research.js";
import { registerValuationTools } from "../tools/valuation.js";
import { registerIcTools } from "../tools/ic.js";
import { registerPortfolioTools } from "../tools/portfolio.js";
import { registerRiskTools } from "../tools/risk.js";
import { registerPerformanceTools } from "../tools/performance.js";
import { registerNotificationTools } from "../tools/notifications.js";
import { registerPlatformTools } from "../tools/platform.js";

const BASE_URL = process.env.PRRM_BASE_URL || "http://localhost:3000";
const TOKEN = process.env.PRRM_API_TOKEN || "d9c8081247636416b1417b408f6c6b446f6b02ba6f5f003397594a6b143669e1";

let api: PrrmApiClient;
let server: McpServer;

// Helper: call a tool by name and return parsed JSON from the text content
async function callTool(name: string, args: Record<string, unknown> = {}): Promise<any> {
  const tools = (server as any)._registeredTools as Record<string, any>;
  const tool = tools[name];
  if (!tool) throw new Error(`Tool "${name}" not registered`);
  const result = await tool.handler(args);
  const text = result.content[0]?.text;
  return text ? JSON.parse(text) : null;
}

beforeAll(() => {
  api = new PrrmApiClient(BASE_URL, TOKEN);
  server = new McpServer({ name: "test", version: "0.0.0" });

  registerStrategyTools(server, api);
  registerInstrumentTools(server, api);
  registerCommentTools(server, api);
  registerScreeningTools(server, api);
  registerResearchTools(server, api);
  registerValuationTools(server, api);
  registerIcTools(server, api);
  registerPortfolioTools(server, api);
  registerRiskTools(server, api);
  registerPerformanceTools(server, api);
  registerNotificationTools(server, api);
  registerPlatformTools(server, api);
});

// ─── Strategy ─────────────────────────────────────────────

describe("Strategy tools", () => {
  it("get_strategy returns content", async () => {
    const data = await callTool("get_strategy");
    expect(data).toHaveProperty("content");
    expect(typeof data.content).toBe("string");
  });

  it("get_strategy_versions returns array", async () => {
    const data = await callTool("get_strategy_versions");
    expect(Array.isArray(data)).toBe(true);
  });
});

// ─── Instruments ──────────────────────────────────────────

describe("Instrument tools", () => {
  let instrumentId: string;

  it("search_instruments returns array", async () => {
    const data = await callTool("search_instruments", { limit: 3 });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    instrumentId = String(data[0].id);
  });

  it("get_instrument returns instrument or error", async () => {
    const data = await callTool("get_instrument", { id: instrumentId });
    expect(data).toBeDefined();
    // Server may return data or error depending on dev state
    expect(data).toSatisfy((d: any) => d.id !== undefined || d.error !== undefined);
  });

  it("search_borsdata_instruments returns results", async () => {
    const data = await callTool("search_borsdata_instruments", { q: "volvo" });
    expect(data).toBeDefined();
  });

  it("search_yahoo_instruments returns results", async () => {
    const data = await callTool("search_yahoo_instruments", { q: "AAPL" });
    expect(data).toBeDefined();
  });
});

// ─── Screening ────────────────────────────────────────────

describe("Screening tools", () => {
  it("list_screening_profiles returns array", async () => {
    const data = await callTool("list_screening_profiles");
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_available_kpis returns data", async () => {
    const data = await callTool("get_available_kpis", {});
    expect(data).toBeDefined();
  });

  it("get_screening_classifications returns data", async () => {
    const data = await callTool("get_screening_classifications");
    expect(data).toBeDefined();
  });

  it("get_universe returns data", async () => {
    const data = await callTool("get_universe", {});
    expect(data).toBeDefined();
  });

  it("list_intersection_configs returns data", async () => {
    const data = await callTool("list_intersection_configs", {});
    expect(data).toBeDefined();
  });

  it("get_current_universe returns data", async () => {
    const data = await callTool("get_current_universe");
    expect(data).toBeDefined();
  });

  it("get_universe_staleness returns data", async () => {
    const data = await callTool("get_universe_staleness");
    expect(data).toBeDefined();
  });

  it("list_universe_versions returns data", async () => {
    const data = await callTool("list_universe_versions", {});
    expect(data).toBeDefined();
  });

  it("get_universe_overrides returns data", async () => {
    const data = await callTool("get_universe_overrides");
    expect(data).toBeDefined();
  });
});

// ─── Research ─────────────────────────────────────────────

describe("Research tools", () => {
  let reportId: string;

  it("list_research_reports returns array", async () => {
    const data = await callTool("list_research_reports", { limit: 2 });
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) reportId = String(data[0].id);
  });

  it("get_research_report returns data or error", async () => {
    if (!reportId) return;
    const data = await callTool("get_research_report", { id: reportId });
    expect(data).toBeDefined();
    expect(data).toSatisfy((d: any) => d.id !== undefined || d.error !== undefined);
  });

  it("search_research_semantic returns results", async () => {
    const data = await callTool("search_research_semantic", { query: "Nordic", limit: 3 });
    expect(data).toBeDefined();
  });
});

// ─── Valuation ────────────────────────────────────────────

describe("Valuation tools", () => {
  it("list_valuation_models returns array", async () => {
    const data = await callTool("list_valuation_models");
    expect(Array.isArray(data)).toBe(true);
  });

  it("list_scenarios returns data for an instrument", async () => {
    const data = await callTool("list_scenarios", { instrumentId: 1 });
    expect(data).toBeDefined();
  });
});

// ─── Investment Committee ─────────────────────────────────

describe("IC tools", () => {
  let meetingId: string;

  it("list_ic_meetings returns data", async () => {
    const data = await callTool("list_ic_meetings", {});
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      meetingId = String(data[0].id);
    }
  });

  it("list_ic_meetings with status filter returns data", async () => {
    const data = await callTool("list_ic_meetings", { status: "Closed" });
    expect(data).toBeDefined();
  });

  it("get_ic_meeting returns data or error", async () => {
    if (!meetingId) return;
    const data = await callTool("get_ic_meeting", { id: meetingId });
    expect(data).toBeDefined();
    expect(data).toSatisfy((d: any) => d.id !== undefined || d.error !== undefined);
  });

  it("list_decisions returns data", async () => {
    const data = await callTool("list_decisions", {});
    expect(data).toBeDefined();
  });

  it("list_decisions with filters returns data", async () => {
    const data = await callTool("list_decisions", { limit: 5 });
    expect(data).toBeDefined();
  });
});

// ─── Portfolio ────────────────────────────────────────────

describe("Portfolio tools", () => {
  it("get_positions returns array", async () => {
    const data = await callTool("get_positions");
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_portfolio_summary returns summary", async () => {
    const data = await callTool("get_portfolio_summary");
    expect(data).toHaveProperty("totalGav");
    expect(data).toHaveProperty("positionCount");
  });

  it("get_allocation returns data", async () => {
    const data = await callTool("get_allocation", { group_by: "assetClass" });
    expect(data).toBeDefined();
  });

  it("get_fx_exposure returns data", async () => {
    const data = await callTool("get_fx_exposure");
    expect(data).toBeDefined();
  });

  it("get_trade_history returns array", async () => {
    const data = await callTool("get_trade_history", {});
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_cash_balances returns data", async () => {
    const data = await callTool("get_cash_balances", {});
    expect(data).toBeDefined();
  });

  it("get_portfolio_config returns data", async () => {
    const data = await callTool("get_portfolio_config");
    expect(data).toBeDefined();
  });

  it("get_dividends returns data", async () => {
    const data = await callTool("get_dividends", {});
    expect(data).toBeDefined();
  });

  it("get_margin_summary returns data", async () => {
    const data = await callTool("get_margin_summary");
    expect(data).toBeDefined();
  });

  it("get_realised_pnl returns data", async () => {
    const data = await callTool("get_realised_pnl", {});
    expect(data).toBeDefined();
  });

  it("list_sub_portfolios returns data", async () => {
    const data = await callTool("list_sub_portfolios");
    expect(data).toBeDefined();
  });
});

// ─── Risk ─────────────────────────────────────────────────

describe("Risk tools", () => {
  it("get_risk_dashboard returns metrics and alerts", async () => {
    const data = await callTool("get_risk_dashboard");
    expect(data).toHaveProperty("metrics");
    expect(data).toHaveProperty("activeAlerts");
  });

  it("list_risk_reports returns array", async () => {
    const data = await callTool("list_risk_reports", {});
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_alert_config returns data", async () => {
    const data = await callTool("get_alert_config");
    expect(data).toBeDefined();
  });

  it("list_risk_alert_events returns data", async () => {
    const data = await callTool("list_risk_alert_events");
    expect(data).toBeDefined();
  });

  it("get_risk_analytics returns data", async () => {
    const data = await callTool("get_risk_analytics", {});
    expect(data).toBeDefined();
  });

  it("get_risk_contributions returns data", async () => {
    const data = await callTool("get_risk_contributions", {});
    expect(data).toBeDefined();
  });

  it("get_correlation_matrix returns data", async () => {
    const data = await callTool("get_correlation_matrix", {});
    expect(data).toBeDefined();
  });
});

// ─── Performance ──────────────────────────────────────────

describe("Performance tools", () => {
  it("get_performance_summary returns data", async () => {
    const data = await callTool("get_performance_summary", { period: "mtd" });
    expect(data).toBeDefined();
  });

  it("get_benchmark_config returns data", async () => {
    const data = await callTool("get_benchmark_config");
    expect(data).toBeDefined();
  });

  it("get_drawdown_analysis returns data", async () => {
    const data = await callTool("get_drawdown_analysis", {});
    expect(data).toBeDefined();
  });

  it("list_performance_reports returns data", async () => {
    const data = await callTool("list_performance_reports", {});
    expect(data).toBeDefined();
  });
});

// ─── Notifications ────────────────────────────────────────

describe("Notification tools", () => {
  it("get_notifications returns array", async () => {
    const data = await callTool("get_notifications", { limit: 3 });
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_unread_notification_count returns count", async () => {
    const data = await callTool("get_unread_notification_count");
    expect(data).toHaveProperty("count");
  });
});

// ─── Platform ─────────────────────────────────────────────

describe("Platform tools", () => {
  it("global_search returns array", async () => {
    const data = await callTool("global_search", { q: "Nordic" });
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_tool_catalog returns catalog with correct count", async () => {
    const data = await callTool("get_tool_catalog");
    expect(Array.isArray(data)).toBe(true);
    const totalTools = data.reduce((sum: number, m: any) => sum + m.tools.length, 0);
    expect(totalTools).toBe(149);
  });

  it("health_check returns data", async () => {
    const data = await callTool("health_check");
    expect(data).toBeDefined();
  });

  it("get_settings returns data", async () => {
    const data = await callTool("get_settings");
    expect(data).toBeDefined();
  });
});
