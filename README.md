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

The server exposes 127 tools across 12 modules. Every tool maps 1:1 to a PRRM REST API endpoint.

### Strategy (4 tools)

| Tool | Description |
|------|-------------|
| `get_strategy` | Get the current investment strategy document |
| `get_strategy_versions` | Get all versions of the investment strategy document |
| `get_strategy_version` | Get a specific strategy version by ID |
| `update_strategy` | Update the investment strategy document with new content |

### Instruments (8 tools)

| Tool | Description |
|------|-------------|
| `search_instruments` | Search for instruments by name, asset class, status, or sector |
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

### Screening & Universe (34 tools)

| Tool | Description |
|------|-------------|
| `list_screening_profiles` | List all screening profiles |
| `get_screening_profile` | Get a specific screening profile by ID |
| `create_screening_profile` | Create a new screening profile with criteria and thresholds |
| `update_screening_profile` | Update an existing screening profile |
| `delete_screening_profile` | Delete a screening profile |
| `run_screen` | Execute a screening profile to find matching instruments |
| `get_screen_results` | Get results from a completed screening run |
| `create_instruments_from_screening` | Create instruments from screening run results |
| `get_available_kpis` | Get available KPIs for screening criteria |
| `get_screening_classifications` | Get available screening classifications |
| `get_universe` | Get the instrument universe with optional filters |
| `update_universe_entry` | Flag or dismiss an instrument in the universe |
| `list_intersection_configs` | List screening intersection configurations |
| `create_intersection_config` | Create an intersection config combining multiple profiles |
| `get_intersection_config` | Get a specific intersection configuration |
| `update_intersection_config` | Update an intersection configuration |
| `delete_intersection_config` | Archive an intersection configuration |
| `run_intersection` | Run a screening intersection pipeline |
| `list_intersection_runs` | List runs for an intersection configuration |
| `get_intersection_run` | Get a specific intersection run with results |
| `get_intersection_diff` | Compare two intersection runs to see what changed |
| `get_current_universe` | Get the current active investment universe |
| `list_universe_versions` | List historical universe versions |
| `get_universe_version` | Get a specific universe version by ID |
| `get_universe_diff` | Diff two universe versions to see what changed |
| `get_universe_staleness` | Check how stale the current universe is |
| `get_position_alerts` | Get position-level alerts for the universe |
| `get_universe_overrides` | Get active manual overrides on the universe |
| `propose_universe` | Create a universe proposal from an intersection run |
| `get_proposal` | Get a universe proposal by ID |
| `update_proposal_instrument` | Toggle instrument inclusion in a universe proposal |
| `add_override_to_proposal` | Add a manual override instrument to a proposal |
| `remove_override_from_proposal` | Remove a manual override from a proposal |
| `commit_universe` | Commit a universe proposal, replacing the active universe |

### Research (5 tools)

| Tool | Description |
|------|-------------|
| `list_research_reports` | List research reports with optional filters |
| `get_research_report` | Get a specific research report by ID |
| `create_research_report` | Create a new research report |
| `update_research_report` | Update an existing research report |
| `search_research_semantic` | Semantic search across research reports |

### Valuation (19 tools)

| Tool | Description |
|------|-------------|
| `list_valuation_models` | List all available valuation models |
| `get_valuation_model` | Get a specific valuation model by ID |
| `create_valuation_model` | Create a new valuation model template |
| `update_valuation_model` | Update an existing valuation model |
| `execute_valuation` | Execute a valuation model against an instrument with input data |
| `get_valuation_output` | Get a specific valuation output by ID |
| `list_valuations_by_instrument` | List all valuation outputs for a specific instrument |
| `autofill_valuation` | Auto-fill valuation inputs from Borsdata data |
| `list_scenarios` | List valuation scenarios for an instrument |
| `create_scenario` | Create a new valuation scenario |
| `get_scenario` | Get a specific valuation scenario by ID |
| `update_scenario` | Update an existing valuation scenario |
| `delete_scenario` | Delete a valuation scenario |
| `copy_scenario` | Create a copy of an existing scenario |
| `execute_scenario` | Execute a valuation scenario to produce an output |
| `get_scenario_history` | Get version history for a scenario |
| `what_if_valuation` | Run a disposable what-if analysis on a scenario |
| `compare_scenarios` | Compare multiple scenarios side by side |
| `export_scenarios_to_ic` | Export scenarios to an IC meeting agenda |

### Investment Committee (10 tools)

| Tool | Description |
|------|-------------|
| `create_ic_meeting` | Create a new investment committee meeting |
| `update_ic_meeting` | Update an IC meeting (status and/or date) |
| `list_ic_meetings` | List investment committee meetings |
| `get_ic_meeting` | Get detailed information about a specific IC meeting |
| `add_agenda_item` | Add an agenda item to an IC meeting |
| `post_minutes` | Post minutes for an IC meeting |
| `update_minutes` | Update existing minutes for an IC meeting |
| `record_decision` | Record a decision from an IC meeting |
| `update_decision_status` | Update the status of an IC decision |
| `list_decisions` | List IC decisions |

### Portfolio (9 tools)

| Tool | Description |
|------|-------------|
| `register_trade` | Register a new trade in the portfolio |
| `get_positions` | Get all current portfolio positions |
| `get_position` | Get position details for a specific instrument |
| `get_trade_history` | Get trade history, optionally filtered by instrument |
| `get_portfolio_summary` | Get a high-level portfolio summary including NAV, returns, and key metrics |
| `get_allocation` | Get portfolio allocation breakdown |
| `get_fx_exposure` | Get portfolio foreign exchange exposure breakdown |
| `update_trade` | Update an existing trade |
| `delete_trade` | Delete a trade from the portfolio |

### Performance (9 tools)

| Tool | Description |
|------|-------------|
| `get_performance_summary` | Get portfolio performance summary for a given period |
| `get_return_series` | Get portfolio and benchmark return time series |
| `get_performance_attribution` | Get performance attribution by position, sector, or currency |
| `get_drawdown_analysis` | Get portfolio drawdown analysis |
| `get_benchmark_config` | Get the current benchmark configuration |
| `set_benchmark` | Set a benchmark instrument for performance comparison |
| `list_performance_reports` | List performance reports with optional filters |
| `create_performance_report` | Create a new performance report |
| `get_performance_report` | Get a specific performance report by ID |

### Risk (14 tools)

| Tool | Description |
|------|-------------|
| `publish_risk_report` | Publish a new risk report |
| `get_risk_report` | Get a specific risk report by ID |
| `get_risk_dashboard` | Get the current risk dashboard with key metrics and alerts |
| `list_risk_reports` | List risk reports with optional filters |
| `get_alert_config` | Get the current risk alert trigger configuration |
| `create_risk_alert_trigger` | Create a new risk alert trigger |
| `update_risk_alert_trigger` | Update an existing risk alert trigger |
| `delete_risk_alert_trigger` | Delete a risk alert trigger |
| `list_risk_alert_events` | List risk alert events |
| `acknowledge_risk_alert_event` | Acknowledge a risk alert event |
| `get_risk_analytics` | Get portfolio risk metrics (VaR, CVaR, volatility) |
| `get_risk_contributions` | Get per-position risk contributions |
| `get_correlation_matrix` | Get position correlation matrix |
| `run_stress_test` | Run a stress test scenario against the portfolio |

### Notifications (4 tools)

| Tool | Description |
|------|-------------|
| `get_notifications` | Get notifications with optional filters |
| `get_unread_notification_count` | Get the count of unread notifications |
| `mark_notification_read` | Mark a specific notification as read |
| `mark_all_notifications_read` | Mark all notifications as read |

### Platform (9 tools)

| Tool | Description |
|------|-------------|
| `global_search` | Search across all PRRM entities (instruments, research, meetings, etc.) |
| `get_tool_catalog` | Get the full catalog of available PRRM MCP tools organized by module |
| `trigger_daily_update` | Trigger the PRRM daily update process |
| `health_check` | Check PRRM server health status |
| `get_settings` | Get PRRM application settings |
| `update_setting` | Update a PRRM application setting |
| `get_webhook_config` | Get outbound webhook configuration |
| `update_webhook_config` | Update outbound webhook configuration |
| `test_webhook` | Send a test webhook to the configured URL |

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
      strategy.ts         # 4 tools
      instruments.ts      # 8 tools
      comments.ts         # 2 tools
      screening.ts        # 34 tools
      research.ts         # 5 tools
      valuation.ts        # 19 tools
      ic.ts               # 10 tools
      portfolio.ts        # 9 tools
      performance.ts      # 9 tools
      risk.ts             # 14 tools
      notifications.ts    # 4 tools
      platform.ts         # 9 tools
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
