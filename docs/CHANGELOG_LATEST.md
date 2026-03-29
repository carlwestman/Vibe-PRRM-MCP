# PRRM MCP — Change Report

**Date:** 2026-03-29
**MCP Package Version:** 0.1.0
**Repo:** https://github.com/carlwestman/Vibe-PRRM-MCP

## How to update

1. Pull the latest version:
   ```bash
   npm install github:carlwestman/Vibe-PRRM-MCP
   # or: cd Vibe-PRRM-MCP && git pull && cd packages/mcp-client && npm install && npm run build
   ```
2. Review the tool changes below and update your agent tool configurations accordingly.

## New tools added

| Tool Name | Module | Description | Parameters |
|-----------|--------|-------------|------------|
| `autofill_valuation` | valuation.ts | Auto-fill valuation inputs from Borsdata data | `modelId` (int, req), `instrumentId` (int, req) |
| `list_scenarios` | valuation.ts | List valuation scenarios for an instrument | `instrumentId` (int, req) |
| `create_scenario` | valuation.ts | Create a new valuation scenario | `data` (object, optional) |
| `get_scenario` | valuation.ts | Get a specific valuation scenario by ID | `id` (string, req) |
| `update_scenario` | valuation.ts | Update an existing valuation scenario | `id` (string, req), `data` (object, optional) |
| `delete_scenario` | valuation.ts | Delete a valuation scenario | `id` (string, req) |
| `copy_scenario` | valuation.ts | Create a copy of an existing scenario | `id` (string, req) |
| `execute_scenario` | valuation.ts | Execute a scenario to produce an output | `id` (string, req) |
| `get_scenario_history` | valuation.ts | Get version history for a scenario | `id` (string, req) |
| `what_if_valuation` | valuation.ts | Run a disposable what-if analysis | `id` (string, req), `data` (object, optional) |
| `compare_scenarios` | valuation.ts | Compare multiple scenarios side by side | `data` (object, optional) |
| `export_scenarios_to_ic` | valuation.ts | Export scenarios to an IC meeting agenda | `data` (object, optional) |

> **Action required:** Register these 12 tools in your agent's available tool list. Note: several scenario endpoints have no request body schema defined yet in the API spec — they accept an optional generic `data` object that will be refined in a future API release.

## No changes

109 tools unchanged from previous sync.

## Full tool count

Total: **121 tools** across **12 modules** (was 109 tools).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening & universe | 34 |
| research | 5 |
| valuation | 19 |
| ic | 10 |
| portfolio | 7 |
| performance | 9 |
| risk | 10 |
| notifications | 4 |
| platform | 9 |
