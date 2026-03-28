#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PrrmApiClient } from "./api-client.js";
import { registerStrategyTools } from "./tools/strategy.js";
import { registerInstrumentTools } from "./tools/instruments.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerScreeningTools } from "./tools/screening.js";
import { registerResearchTools } from "./tools/research.js";
import { registerValuationTools } from "./tools/valuation.js";
import { registerIcTools } from "./tools/ic.js";
import { registerPortfolioTools } from "./tools/portfolio.js";
import { registerRiskTools } from "./tools/risk.js";
import { registerNotificationTools } from "./tools/notifications.js";
import { registerPerformanceTools } from "./tools/performance.js";
import { registerPlatformTools } from "./tools/platform.js";

const GUIDE_CONTENT = `# PRRM Integration Guide

## Overview
PRRM (Portfolio Research & Risk Management) is a platform for managing investment research workflows.
It provides tools for instrument tracking, screening, research reports, valuation models,
investment committee management, portfolio tracking, and risk monitoring.

## Getting Started
1. Use \`get_tool_catalog\` to see all available tools organized by module.
2. Use \`global_search\` to find instruments, research, or meetings by keyword.
3. Use \`get_strategy\` to read the current investment strategy.

## Common Workflows

### Research an Instrument
1. \`search_instruments\` — find the instrument
2. \`get_instrument\` — get full details
3. \`list_research_reports\` with instrument_id — see existing research
4. \`list_valuations_by_instrument\` — see valuations
5. \`get_comments\` — read discussion threads

### Prepare for IC Meeting
1. \`list_ic_meetings\` — find upcoming meetings
2. \`get_ic_meeting\` — see agenda and details
3. \`add_agenda_item\` — add items to discuss
4. \`record_decision\` — capture decisions after the meeting

### Monitor Risk & Performance
1. \`get_risk_dashboard\` — current risk overview
2. \`get_performance_summary\` — returns and ratios
3. \`get_performance_attribution\` — what drove returns
4. \`get_drawdown_analysis\` — drawdown history
5. \`get_portfolio_summary\` — NAV and returns
6. \`get_allocation\` — allocation breakdown
7. \`get_fx_exposure\` — currency exposure

### Run a Screen
1. \`get_available_kpis\` — see available metrics
2. \`create_screening_profile\` — define criteria
3. \`run_screen\` — execute the screen
4. \`get_screen_results\` — review matches
`;

function main() {
  const baseUrl = process.env.PRRM_BASE_URL;
  const token = process.env.PRRM_API_TOKEN;

  if (!baseUrl || !token) {
    process.stderr.write(
      "Error: PRRM_BASE_URL and PRRM_API_TOKEN environment variables are required.\n" +
      "  PRRM_BASE_URL=https://your-prrm-server.com\n" +
      "  PRRM_API_TOKEN=your-agent-token\n"
    );
    process.exit(1);
  }

  const api = new PrrmApiClient(baseUrl, token);

  const server = new McpServer({
    name: "prrm-mcp",
    version: "0.1.0",
  });

  // Register guide resource
  server.resource("prrm-guide", "prrm://guide", async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "text/markdown",
      text: GUIDE_CONTENT,
    }],
  }));

  // Register all tool modules
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

  // Start stdio transport
  const transport = new StdioServerTransport();
  server.connect(transport);

  process.stderr.write(`prrm-mcp server started — connected to ${baseUrl}\n`);
}

main();
