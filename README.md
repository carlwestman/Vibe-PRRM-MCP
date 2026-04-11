# @wsvc/prrm-mcp

A standalone MCP (Model Context Protocol) server that proxies tool calls to the PRRM (Portfolio Research & Risk Management) REST API. It requires no database connection and no PRRM codebase dependency -- just two environment variables and a running PRRM server.

## Architecture

```
+--------------+    stdio     +------------------+    HTTPS    +--------------+
|  Claude Code | ------------ |  prrm-mcp-client | ---------- |  PRRM VPS    |
|  / OpenClaw  |              |  (this package)  |            |  /api/v1/*   |
+--------------+              +------------------+            +--------------+
```

The MCP server communicates with the AI agent over stdio and forwards every tool call to the PRRM REST API over HTTP(S). All responses are unwrapped from the standard `{ data: ... }` envelope and returned as JSON text content.

## Quick Start

### Option A: Install from npm (if published)

```bash
# Run directly with npx (no install required)
PRRM_BASE_URL=https://prrm.example.com PRRM_API_TOKEN=your-token npx @wsvc/prrm-mcp

# Or install globally
npm install -g @wsvc/prrm-mcp
PRRM_BASE_URL=https://prrm.example.com PRRM_API_TOKEN=your-token prrm-mcp
```

### Option B: Install from GitHub

If the package is not published to npm, you can install directly from the GitHub repository:

```bash
# Install globally from GitHub (uses the packages/mcp-client directory)
npm install -g github:wsvc/Vibe-PRRM-MCP

# Or add to a project
npm install github:wsvc/Vibe-PRRM-MCP
```

You can also clone and build locally:

```bash
git clone https://github.com/wsvc/Vibe-PRRM-MCP.git
cd Vibe-PRRM-MCP/packages/mcp-client
npm install
npm run build
npm link   # makes 'prrm-mcp' available globally on your machine

# Then run it anywhere
PRRM_BASE_URL=https://prrm.example.com PRRM_API_TOKEN=your-token prrm-mcp
```

### Configure with Claude Code

Add the following to your `claude_desktop_config.json` or `.claude.json`.

When installed from npm:

```json
{
  "mcpServers": {
    "prrm": {
      "command": "npx",
      "args": ["@wsvc/prrm-mcp"],
      "env": {
        "PRRM_BASE_URL": "https://prrm.example.com",
        "PRRM_API_TOKEN": "your-agent-token"
      }
    }
  }
}
```

When installed from a local clone (adjust the path to your clone location):

```json
{
  "mcpServers": {
    "prrm": {
      "command": "node",
      "args": ["C:/path/to/Vibe-PRRM-MCP/packages/mcp-client/dist/index.js"],
      "env": {
        "PRRM_BASE_URL": "https://prrm.example.com",
        "PRRM_API_TOKEN": "your-agent-token"
      }
    }
  }
}
```

### Configure with OpenClaw

Add the following to your `openclaw.json`:

```json
{
  "mcpServers": {
    "prrm": {
      "command": "npx",
      "args": ["@wsvc/prrm-mcp"],
      "env": {
        "PRRM_BASE_URL": "https://prrm.example.com",
        "PRRM_API_TOKEN": "${DOLLAR_BILL_PRRM_TOKEN}"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRRM_BASE_URL` | Yes | Base URL of the PRRM server (e.g. `https://prrm.example.com` or `http://IP:3000`) |
| `PRRM_API_TOKEN` | Yes | Bearer token for API authentication, created in PRRM Settings |
| `PRRM_MCP_DEBUG` | No | Set to `true` to log all API calls with timestamps to stderr |

## Tool Catalog

The server exposes 136 tools across 12 modules. Every tool maps 1:1 (or 1:many for merged list/get tools) to a PRRM REST API endpoint.

### Strategy (3 tools)

| Tool | Description |
|------|-------------|
| `get_strategy` | Get the current investment strategy, or a historical version when versionId is set. WARNING: historical versions lack the updatedAt field. |
| `get_strategy_versions` | List all versions of the investment strategy document |
| `update_strategy` | Update the investment strategy document with new content |

### Instruments (8 tools)

| Tool | Description |
|------|-------------|
| `search_prrm_instruments` | Search PRRM instruments by name, asset class, status, or sector |
| `get_instrument` | Get detailed information about a specific instrument by ID |
| `create_instrument` | Create a new instrument in the system |
| `update_instrument` | Update fields on an existing instrument |
| `add_external_id` | Add an external identifier to an instrument |
| `remove_external_id` | Remove an external identifier from an instrument |
| `search_borsdata_instruments` | Search Borsdata for instruments to import |
| `search_yahoo_instruments` | Search Yahoo Finance for instruments to import |

### Comments (2 tools)

| Tool | Description |
|------|-------------|
| `get_comments` | Get comments for an instrument or research report |
| `add_comment` | Add a comment to an instrument or research report |

### Screening & Universe (32 tools)

| Tool | Description |
|------|-------------|
| `list_screening_profiles` | List screening profiles, or fetch one when id is set |
| `create_screening_profile` | Create a new screening profile with criteria and thresholds |
| `update_screening_profile` | Update an existing screening profile |
| `delete_screening_profile` | Delete a screening profile |
| `run_screen` | Execute a screening profile to find matching instruments |
| `evaluate_instrument_against_profile` | Evaluate a single instrument against a profile's criteria |
| `get_screen_results` | Get results from a completed screening run |
| `create_instruments_from_screening` | Create instruments from screening run results |
| `get_available_kpis` | Get available KPIs for screening criteria |
| `get_screening_classifications` | Get available screening classifications |
| `get_universe` | Get the current universe (no params) or filtered universe (with params) |
| `update_universe_entry` | Flag or dismiss an instrument in the universe |
| `list_intersection_configs` | List intersection configs, or fetch one when id is set |
| `create_intersection_config` | Create an intersection config combining multiple profiles |
| `update_intersection_config` | Update an intersection configuration |
| `delete_intersection_config` | Archive an intersection configuration |
| `run_intersection` | Run a screening intersection pipeline |
| `list_intersection_runs` | List runs for a config (with configId), or fetch a single run (with runId) |
| `get_intersection_diff` | Compare two intersection runs to see what changed |
| `list_universe_versions` | List universe versions, or fetch one when id is set. WARNING: list returns wrapped {data: [...]}, single returns bare object. |
| `get_universe_diff` | Diff two universe versions to see what changed |
| `get_universe_staleness` | Check how stale the current universe is |
| `get_position_alerts` | Get position-level alerts for the universe |
| `get_universe_overrides` | Get active manual overrides on the universe |
| `create_universe_override` | Add a manual override instrument directly to the universe |
| `bulk_create_instruments` | Bulk-create instruments from a universe version |
| `propose_universe` | Create a universe proposal from an intersection run |
| `get_proposal` | Get a universe proposal by ID |
| `update_proposal_instrument` | Toggle instrument inclusion in a universe proposal |
| `add_override_to_proposal` | Add a manual override instrument to a proposal |
| `remove_override_from_proposal` | Remove a manual override from a proposal |
| `commit_universe` | Commit a universe proposal, replacing the active universe |

### Research (4 tools)

| Tool | Description |
|------|-------------|
| `list_research_reports` | List research reports, or fetch one when id is set |
| `create_research_report` | Create a new research report (instrumentIds is mutable post-creation) |
| `update_research_report` | Update an existing research report |
| `search_research_semantic` | Semantic search across research reports |

### Valuation (15 tools)

| Tool | Description |
|------|-------------|
| `list_valuation_models` | List models, or fetch one when id is set |
| `create_valuation_model` | Create a new valuation model template |
| `update_valuation_model` | Update an existing valuation model |
| `list_valuations_by_instrument` | List valuation outputs for an instrument (with instrument_id), or fetch one (with id) |
| `autofill_valuation` | Auto-fill valuation inputs from Borsdata. Returns {inputs, sources} — pass autofill.inputs (NOT the wrapper) to create_scenario. |
| `list_scenarios` | List scenarios for an instrument (with instrumentId), or fetch one (with id) |
| `create_scenario` | Create a new valuation scenario (inputData and author are required) |
| `update_scenario` | Update an existing valuation scenario |
| `delete_scenario` | Delete a valuation scenario |
| `copy_scenario` | Create a copy of an existing scenario |
| `execute_scenario` | Execute a valuation scenario to produce an output |
| `get_scenario_history` | Get version history for a scenario |
| `what_if_valuation` | Run a disposable what-if analysis on a scenario |
| `compare_scenarios` | Compare multiple scenarios side by side |
| `export_scenarios_to_ic` | Export scenarios to an IC meeting agenda |

### Investment Committee (16 tools)

| Tool | Description |
|------|-------------|
| `create_ic_meeting` | Create a new investment committee meeting |
| `update_ic_meeting` | Update an IC meeting (status and/or date) |
| `list_ic_meetings` | List IC meetings, or fetch one when id is set |
| `add_agenda_item` | Add an agenda item to a meeting |
| `update_agenda_item` | Update an existing agenda item |
| `remove_agenda_item` | Remove an agenda item |
| `reorder_agenda_items` | Set the display order for agenda items |
| `list_prereads` | List pre-reads for an agenda item, or fetch one when prereadId is set |
| `post_preread` | Attach a pre-read document to an agenda item |
| `update_preread` | Update an existing pre-read |
| `delete_preread` | Delete a pre-read |
| `post_minutes` | Post minutes for an IC meeting |
| `update_minutes` | Update existing minutes |
| `record_decision` | Record an IC decision |
| `update_decision_status` | Update decision status (pending/executed/cancelled) |
| `list_decisions` | List IC decisions with optional filters |

### Portfolio (30 tools)

| Tool | Description |
|------|-------------|
| `register_trade` | Register a new trade in the portfolio |
| `get_positions` | Get all current portfolio positions |
| `get_position` | Get position details for a specific instrument |
| `update_position_price` | Update the price on a portfolio position |
| `assign_position_sleeve` | Assign a position to a sub-portfolio sleeve |
| `get_trade_history` | Get trade history, optionally filtered by instrument |
| `get_portfolio_summary` | Get a high-level portfolio summary including NAV, returns, and key metrics |
| `get_allocation` | Get portfolio allocation breakdown |
| `get_fx_exposure` | Get portfolio foreign exchange exposure breakdown |
| `update_trade` | Update an existing trade |
| `delete_trade` | Delete a trade from the portfolio |
| `get_cash_balances` | Get cash balances across currencies |
| `record_deposit` | Record a cash deposit |
| `record_withdrawal` | Record a cash withdrawal |
| `get_cash_transactions` | List cash transactions with optional filters |
| `update_cash_transaction` | Update a cash transaction |
| `delete_cash_transaction` | Delete a cash transaction |
| `get_portfolio_config` | Get portfolio configuration |
| `update_portfolio_config` | Update portfolio configuration |
| `get_dividends` | List dividends with optional filters |
| `record_dividend` | Record a dividend payment |
| `sync_dividends` | Sync dividends from Borsdata |
| `import_portfolio` | Import portfolio data |
| `import_transactions` | Import transactions from an external source |
| `get_margin_summary` | Get margin utilization summary |
| `get_realised_pnl` | Get realized P&L from closed positions |
| `list_sub_portfolios` | List sub-portfolios (no params), fetch one (with id), or get summary (with summary: true) |
| `create_sub_portfolio` | Create a new sub-portfolio |
| `update_sub_portfolio` | Update a sub-portfolio |
| `delete_sub_portfolio` | Delete a sub-portfolio |

### Performance (8 tools)

| Tool | Description |
|------|-------------|
| `get_performance_summary` | Get portfolio performance summary for a given period |
| `get_return_series` | Get portfolio and benchmark return time series |
| `get_performance_attribution` | Get performance attribution by position, sector, or currency |
| `get_drawdown_analysis` | Get portfolio drawdown analysis |
| `get_benchmark_config` | Get the current benchmark configuration |
| `set_benchmark` | Set a benchmark instrument for performance comparison |
| `list_performance_reports` | List performance reports, or fetch one when id is set |
| `create_performance_report` | Create a new performance report |

### Risk (13 tools)

| Tool | Description |
|------|-------------|
| `publish_risk_report` | Publish a new risk report |
| `list_risk_reports` | List risk reports, or fetch one when id is set |
| `get_risk_dashboard` | Get the current risk dashboard with key metrics and alerts |
| `get_alert_config` | Get the current risk alert trigger configuration |
| `create_risk_alert_trigger` | Create a new risk alert trigger |
| `update_risk_alert_trigger` | Update an existing risk alert trigger |
| `delete_risk_alert_trigger` | Delete a risk alert trigger |
| `list_risk_alert_events` | List risk alert events |
| `acknowledge_risk_alert_event` | Acknowledge a risk alert event |
| `get_risk_analytics` | Get portfolio risk metrics (VaR, CVaR, volatility) |
| `get_risk_contributions` | Get per-position risk contributions |
| `get_correlation_matrix` | Get position correlation matrix |
| `run_prrm_stress_test` | Run a stress test scenario against the PRRM portfolio (renamed from run_stress_test to avoid collision with portfolio-optimizer) |

### Notifications (4 tools)

| Tool | Description |
|------|-------------|
| `get_notifications` | Get notifications with optional filters |
| `get_unread_notification_count` | Get the count of unread notifications |
| `mark_notification_read` | Mark a specific notification as read |
| `mark_all_notifications_read` | Mark all notifications as read |

### Platform (1 tool)

| Tool | Description |
|------|-------------|
| `global_search` | Search across all PRRM entities (instruments, research, meetings, etc.) |

## MCP Resources

The server exposes one MCP resource:

| URI | Description |
|-----|-------------|
| `prrm://guide` | An embedded integration guide covering common workflows such as researching an instrument, preparing for an IC meeting, monitoring risk, and running a screen. |

## Error Handling

The server never throws exceptions from tool handlers. HTTP errors are translated into text content so the agent can read the error and react appropriately.

| HTTP Status | Behavior |
|-------------|----------|
| 200, 201 | Returns the `data` field from the response envelope |
| 400, 422 | Returns the validation error message as tool result |
| 401 | Returns "Authentication failed -- check PRRM_API_TOKEN" |
| 404 | Returns "Not found" message |
| 500, 503 | Returns the error message from the server |

## Development

### Prerequisites

- Node.js 18+ (uses built-in `fetch`)
- A running PRRM server instance

### Project structure

```
packages/mcp-client/
  package.json
  tsconfig.json
  src/
    index.ts              # Entry point, MCP server setup, guide resource
    api-client.ts         # HTTP client wrapper (fetch + auth + error handling)
    tools/
      strategy.ts         # 3 tools
      instruments.ts      # 8 tools
      comments.ts         # 2 tools
      screening.ts        # 32 tools
      research.ts         # 4 tools
      valuation.ts        # 15 tools
      ic.ts               # 16 tools
      portfolio.ts        # 30 tools
      performance.ts      # 8 tools
      risk.ts             # 13 tools
      notifications.ts    # 4 tools
      platform.ts         # 1 tool
```

### Build

```bash
cd packages/mcp-client
npm install
npm run build          # Compiles TypeScript to dist/
```

### Run in development mode

```bash
cd packages/mcp-client
PRRM_BASE_URL=http://localhost:3000 PRRM_API_TOKEN=test npm run dev
```

This uses `tsx` for on-the-fly TypeScript execution without a build step.

### Run the built version

```bash
cd packages/mcp-client
PRRM_BASE_URL=http://localhost:3000 PRRM_API_TOKEN=test npm start
```

## Publishing

```bash
cd packages/mcp-client
npm run build
npm publish --access public
```

The package is published as `@wsvc/prrm-mcp` and can be run with `npx @wsvc/prrm-mcp` or installed globally.

## License

See repository root for license information.
