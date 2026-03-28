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

  it("get_instrument returns instrument by ID", async () => {
    const data = await callTool("get_instrument", { id: instrumentId });
    expect(data).toHaveProperty("id");
    expect(String(data.id)).toBe(instrumentId);
  });

  it("get_instrument 404 returns error", async () => {
    const data = await callTool("get_instrument", { id: "99999" });
    expect(data).toHaveProperty("error");
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
});

// ─── Research ─────────────────────────────────────────────

describe("Research tools", () => {
  let reportId: string;

  it("list_research_reports returns array", async () => {
    const data = await callTool("list_research_reports", { limit: 2 });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    reportId = String(data[0].id);
  });

  it("get_research_report returns report by ID", async () => {
    const data = await callTool("get_research_report", { id: reportId });
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("body");
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
});

// ─── Investment Committee ─────────────────────────────────

describe("IC tools", () => {
  let meetingId: string;

  it("list_ic_meetings returns array", async () => {
    const data = await callTool("list_ic_meetings", { limit: 2 });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    meetingId = String(data[0].id);
  });

  it("get_ic_meeting returns meeting details", async () => {
    const data = await callTool("get_ic_meeting", { id: meetingId });
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("meetingDate");
  });

  it("list_decisions returns array", async () => {
    const data = await callTool("list_decisions", { limit: 5 });
    expect(Array.isArray(data)).toBe(true);
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
    const data = await callTool("get_allocation", { group_by: "asset_class" });
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
});

// ─── Risk ─────────────────────────────────────────────────

describe("Risk tools", () => {
  it("get_risk_dashboard returns metrics and alerts", async () => {
    const data = await callTool("get_risk_dashboard");
    expect(data).toHaveProperty("metrics");
    expect(data).toHaveProperty("activeAlerts");
  });

  it("list_risk_reports returns array", async () => {
    const data = await callTool("list_risk_reports", { limit: 2 });
    expect(Array.isArray(data)).toBe(true);
  });

  it("get_alert_config returns data", async () => {
    const data = await callTool("get_alert_config");
    expect(data).toBeDefined();
  });

  it("get_risk_decomposition returns data", async () => {
    const data = await callTool("get_risk_decomposition");
    expect(data).toBeDefined();
  });

  it("get_holdings_for_optimizer returns data", async () => {
    const data = await callTool("get_holdings_for_optimizer");
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

  it("get_tool_catalog returns catalog", async () => {
    const data = await callTool("get_tool_catalog");
    expect(Array.isArray(data)).toBe(true);
    const totalTools = data.reduce((sum: number, m: any) => sum + m.tools.length, 0);
    expect(totalTools).toBe(68);
  });
});
