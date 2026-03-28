# PRRM MCP — Change Report

**Date:** 2026-03-28
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
| `list_intersection_configs` | screening.ts | List screening intersection configurations | `status` (string, optional) |
| `create_intersection_config` | screening.ts | Create an intersection config combining multiple profiles | `name` (string, req), `description` (string), `pipeline` (array, req), `scoring` (object) |
| `get_intersection_config` | screening.ts | Get a specific intersection configuration | `id` (string, req) |
| `update_intersection_config` | screening.ts | Update an intersection configuration | `id` (string, req), `name`, `description`, `pipeline`, `scoring` |
| `delete_intersection_config` | screening.ts | Archive an intersection configuration | `id` (string, req) |
| `run_intersection` | screening.ts | Run a screening intersection pipeline | `id` (string, req), `forceRefresh` (bool), `dryRun` (bool), `syncToUniverse` (bool), `triggeredBy` (string), `triggerType` (string) |
| `list_intersection_runs` | screening.ts | List runs for an intersection configuration | `id` (string, req) |
| `get_intersection_run` | screening.ts | Get a specific intersection run with results | `id` (string, req) |
| `get_intersection_diff` | screening.ts | Compare two intersection runs to see what changed | `id` (string, req), `otherId` (string, req) |

> **Action required:** Register these 9 tools in your agent's available tool list.

## No changes

87 tools unchanged from previous sync.

## Full tool count

Total: **96 tools** across **12 modules** (was 87 tools).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening | 21 |
| research | 5 |
| valuation | 7 |
| ic | 10 |
| portfolio | 7 |
| performance | 9 |
| risk | 10 |
| notifications | 4 |
| platform | 9 |
