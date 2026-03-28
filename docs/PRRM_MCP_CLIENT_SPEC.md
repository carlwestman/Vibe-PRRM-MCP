# PRRM MCP Client — Specification

## Overview

A lightweight, standalone MCP server that proxies all tool calls to the PRRM REST API over HTTP. No database connection, no PRRM codebase dependency. Installable as a standalone npm package and runnable with `npx`.

```
┌──────────────┐    stdio     ┌──────────────────┐    HTTPS    ┌──────────────┐
│  OpenClaw    │ ─────────── │  prrm-mcp-client  │ ─────────── │  PRRM VPS    │
│  Agent       │              │  (this package)   │             │  /api/v1/*   │
└──────────────┘              └──────────────────┘              └──────────────┘
```

## Design Principles

1. **Zero database dependency** — all data goes through PRRM REST API
2. **Single file, minimal deps** — `@modelcontextprotocol/sdk`, `zod`, `node-fetch` (or built-in `fetch`)
3. **Authenticated** — requires `PRRM_BASE_URL` and `PRRM_API_TOKEN` env vars
4. **1:1 tool mapping** — every tool name and parameter schema matches the existing MCP server
5. **Standalone package** — lives in `packages/mcp-client/`, has its own `package.json`
6. **Installable globally** — `npm install -g @wsvc/prrm-mcp` or `npx @wsvc/prrm-mcp`

## Configuration

```bash
# Required environment variables
PRRM_BASE_URL=https://your-prrm-server.com   # or http://IP:3000
PRRM_API_TOKEN=your-agent-token               # Bearer token from PRRM Settings

# Optional
PRRM_MCP_DEBUG=true                           # Log all API calls to stderr
```

## Usage

```bash
# Run directly
PRRM_BASE_URL=https://prrm.example.com PRRM_API_TOKEN=abc123 npx @wsvc/prrm-mcp

# Or in OpenClaw openclaw.json
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

## Package Structure

```
packages/mcp-client/
  package.json          # name: @wsvc/prrm-mcp, bin: prrm-mcp
  tsconfig.json
  src/
    index.ts            # Entry point — starts MCP server
    api-client.ts       # HTTP client wrapper (fetch + auth + error handling)
    tools/
      strategy.ts       # 3 tools
      instruments.ts     # 4 tools
      comments.ts        # 2 tools
      screening.ts       # 9 tools
      research.ts        # 5 tools + 1 search
      valuation.ts       # 8 tools
      ic.ts              # 14 tools
      portfolio.ts       # 9 tools
      risk.ts            # 8 tools
      notifications.ts   # 2 tools
      platform.ts        # 3 tools (search, catalog, daily-update)
```

## API Client (`api-client.ts`)

A thin HTTP wrapper shared by all tools:

```typescript
class PrrmApiClient {
  constructor(baseUrl: string, token: string)

  // Core methods
  async get(path: string, params?: Record<string, string>): Promise<any>
  async post(path: string, body?: any): Promise<any>
  async put(path: string, body?: any): Promise<any>
  async patch(path: string, body?: any): Promise<any>
  async delete(path: string): Promise<any>
}
```

Every method:
- Prepends `baseUrl` to the path
- Sets `Authorization: Bearer ${token}` header
- Sets `Content-Type: application/json` for POST/PUT/PATCH
- Parses the JSON response
- Returns `response.data` (unwraps the standard `{ data: ... }` envelope)
- Throws on HTTP errors with the error message from `response.error`

## Tool-to-Endpoint Mapping

Every tool is a thin function: validate params with Zod → call API client → return JSON result.

### Strategy (3 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `get_strategy` | GET | `/strategy` | — |
| `get_strategy_versions` | GET | `/strategy/versions` | — |
| `update_strategy` | PUT | `/strategy` | `{ content, author }` → body |

### Instruments (4 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `search_instruments` | GET | `/instruments` | `q, asset_class, status, sector, limit, offset` → query |
| `get_instrument` | GET | `/instruments/{id}` | `id` → path |
| `create_instrument` | POST | `/instruments` | all fields → body |
| `update_instrument` | PATCH | `/instruments/{id}` | `id` → path, rest → body |

### Comments (2 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `get_comments` | GET | `/instruments/{entity_id}/comments` | `entity_type, entity_id` → path (note: entity_type determines the base path) |
| `add_comment` | POST | `/instruments/{entity_id}/comments` | `entity_type, entity_id` → path, `body, author, parent_id` → body |

Note: Comments are accessed via the parent entity's endpoint:
- `entity_type: "instrument"` → `/instruments/{id}/comments`
- `entity_type: "research"` → `/research/{id}/comments`

### Screening (9 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `list_screening_profiles` | GET | `/screening/profiles` | — |
| `get_screening_profile` | GET | `/screening/profiles/{id}` | `id` → path |
| `create_screening_profile` | POST | `/screening/profiles` | all fields → body |
| `update_screening_profile` | PATCH | `/screening/profiles/{id}` | `id` → path, rest → body |
| `run_screen` | POST | `/screening/profiles/{profileId}/run` | `profileId` → path |
| `get_screen_results` | GET | `/screening/runs/{runId}/results` | `runId` → path |
| `get_available_kpis` | GET | `/screening/kpis` | `category, q` → query |
| `get_screening_classifications` | GET | `/screening/classifications` | — |
| `get_universe` | GET | `/universe` | `flagged, dismissed` → query |

### Research (6 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `list_research_reports` | GET | `/research` | `type, status, instrument_id, author, recommendation, conviction, limit, offset` → query |
| `get_research_report` | GET | `/research/{id}` | `id` → path |
| `create_research_report` | POST | `/research` | all fields → body |
| `update_research_report` | PATCH | `/research/{id}` | `id` → path, rest → body |
| `link_valuation_to_research` | POST | `/research/{report_id}/link-valuation` | `report_id` → path, `valuation_output_id` → body |
| `search_research_semantic` | POST | `/research/search` | `query, limit` → body |

### Valuation (8 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `list_valuation_models` | GET | `/valuation/models` | — |
| `get_valuation_model` | GET | `/valuation/models/{id}` | `id` → path |
| `create_valuation_model` | POST | `/valuation/models` | all fields → body |
| `update_valuation_model` | PATCH | `/valuation/models/{id}` | `id` → path, rest → body |
| `execute_valuation` | POST | `/valuation/execute` | `modelId, instrumentId, inputData, author` → body |
| `get_valuation_output` | GET | `/valuation/outputs/{id}` | `id` → path |
| `list_valuations_by_instrument` | GET | `/valuation/outputs` | `instrument_id` → query |
| `link_valuation_to_report` | POST | `/research/{report_id}/link-valuation` | same as research link |

### Investment Committee (14 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `create_ic_meeting` | POST | `/ic/meetings` | `meeting_date` → body as `{ meetingDate }` |
| `update_meeting_status` | PATCH | `/ic/meetings/{id}` | `id` → path, `status` → body |
| `list_ic_meetings` | GET | `/ic/meetings` | `status, limit, offset` → query |
| `get_ic_meeting` | GET | `/ic/meetings/{id}` | `id` → path |
| `add_agenda_item` | POST | `/ic/meetings/{meeting_id}/agenda` | `meeting_id` → path, rest → body |
| `update_agenda_item` | PATCH | `/ic/meetings/{meeting_id}/agenda` | (via body `{ id, ... }`) |
| `remove_agenda_item` | DELETE | `/ic/meetings/{meeting_id}/agenda/{id}` | path params |
| `reorder_agenda_items` | PUT | `/ic/meetings/{meeting_id}/agenda/reorder` | `ordered_ids` → body |
| `post_preread` | POST | `/ic/agenda/{agenda_item_id}/prereads` | `agenda_item_id` → path, rest → body |
| `post_minutes` | POST | `/ic/meetings/{meeting_id}/minutes` | `meeting_id` → path, `body, author` → body |
| `update_minutes` | PATCH | `/ic/meetings/{meeting_id}/minutes` | `meeting_id` → path, `id, body` → body |
| `record_decision` | POST | `/ic/decisions` | `meeting_id, text, assignee, due_date` → body |
| `update_decision_status` | PATCH | `/ic/decisions/{id}` | `id` → path, `status, note` → body |
| `list_decisions` | GET | `/ic/decisions` | `status, meeting_id, assignee, limit, offset` → query |

### Portfolio (9 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `register_trade` | POST | `/portfolio/trades` | all fields → body |
| `get_positions` | GET | `/portfolio/positions` | — |
| `get_position` | GET | `/portfolio/positions/{instrument_id}` | `instrument_id` → path |
| `get_trade_history` | GET | `/portfolio/trades` | `instrument_id` → query |
| `get_portfolio_summary` | GET | `/portfolio/summary` | — |
| `get_allocation` | GET | `/portfolio/allocation` | `group_by` → query |
| `get_fx_exposure` | GET | `/portfolio/fx-exposure` | — |
| `recalculate_positions` | POST | `/daily-update` | — (triggers full update) |
| `snapshot_portfolio` | POST | `/daily-update` | — (triggers full update) |

Note: `recalculate_positions` and `snapshot_portfolio` both map to the daily update endpoint since they're part of the same job.

### Risk (8 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `publish_risk_report` | POST | `/risk/reports` | all fields → body |
| `get_risk_dashboard` | GET | `/risk/dashboard` | — |
| `list_risk_reports` | GET | `/risk/reports` | `type, date_from, date_to, limit, offset` → query |
| `get_alert_config` | GET | `/risk/alerts/config` | — |
| `suggest_alert_change` | POST | `/risk/alerts/config` | `metric, condition, threshold, severity` → body |
| `record_alert_event` | POST | `/risk/alerts/events` | `trigger_id, metric_value` → body |
| `get_risk_decomposition` | GET | `/risk/decomposition` | — |
| `get_holdings_for_optimizer` | GET | `/risk/holdings-for-optimizer` | — |

### Notifications (2 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `get_notifications` | GET | `/notifications` | `unread_only, limit, offset` → query |
| `get_unread_notification_count` | GET | `/notifications/unread-count` | — |

### Platform (3 tools)

| Tool | Method | Endpoint | Params → Query/Body |
|------|--------|----------|---------------------|
| `global_search` | GET | `/search` | `q, type` → query |
| `get_tool_catalog` | — | — | Returns hardcoded catalog (no API call needed) |
| `trigger_daily_update` | POST | `/daily-update` | — |

## Tool Implementation Pattern

Every tool follows this exact pattern:

```typescript
server.tool(
  "tool_name",
  "Description of what this tool does",
  {
    // Zod schema for parameters (same as existing MCP server)
    param1: z.string().describe("..."),
    param2: z.number().optional().describe("..."),
  },
  async (params) => {
    const result = await api.get("/some/endpoint", { param1: params.param1 });
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);
```

## Error Handling

The API client translates HTTP errors to MCP tool errors:

| HTTP Status | MCP Behavior |
|-------------|-------------|
| 200, 201 | Return `data` field from response |
| 400, 422 | Return error message as tool result (not a throw — let the agent see the validation error) |
| 401 | Return "Authentication failed — check PRRM_API_TOKEN" |
| 404 | Return "Not found" message |
| 500, 503 | Return error message from server |

Never throw exceptions from tool handlers — always return the error as text content so the agent can see it and react.

## MCP Resources

The client also exposes one MCP resource:

```typescript
server.resource("prrm-guide", "prrm://guide", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "text/markdown",
    text: GUIDE_CONTENT, // Hardcoded copy of the PRRM integration guide
  }],
}));
```

The guide content is embedded in the package at build time (copy from `src/mcp/resources/guide.ts`).

## Build & Publish

```bash
# Build
cd packages/mcp-client
npm run build     # TypeScript → dist/

# Local test
PRRM_BASE_URL=http://localhost:3000 PRRM_API_TOKEN=test npx tsx src/index.ts

# Publish (if using npm registry)
npm publish --access public
```

## `package.json`

```json
{
  "name": "@wsvc/prrm-mcp",
  "version": "0.1.0",
  "description": "MCP client for PRRM — proxies tool calls to the PRRM REST API",
  "bin": {
    "prrm-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "tsx": "^4.19.4"
  }
}
```

## Total: 67 tools across 11 modules

| Module | Tools | REST Endpoints Used |
|--------|-------|-------------------|
| Strategy | 3 | 3 |
| Instruments | 4 | 4 |
| Comments | 2 | 2 |
| Screening | 9 | 8 |
| Research | 6 | 6 |
| Valuation | 8 | 6 |
| IC | 14 | 11 |
| Portfolio | 9 | 7 |
| Risk | 8 | 7 |
| Notifications | 2 | 2 |
| Platform | 3 | 2 |
| **Total** | **68** | **58** |
