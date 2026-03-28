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
| `get_current_universe` | screening.ts | Get the current active investment universe | none |
| `list_universe_versions` | screening.ts | List historical universe versions | `limit` (int), `offset` (int) |
| `get_universe_version` | screening.ts | Get a specific universe version by ID | `id` (string, req) |
| `get_universe_diff` | screening.ts | Diff two universe versions | `from` (int, req), `to` (int, req) |
| `get_universe_staleness` | screening.ts | Check how stale the current universe is | none |
| `get_position_alerts` | screening.ts | Get position-level alerts for the universe | none |
| `get_universe_overrides` | screening.ts | Get active manual overrides | none |
| `propose_universe` | screening.ts | Create a universe proposal from an intersection run | `intersectionRunId` (int, req), `selectedResultIds` (int[]), `overrides` (array), `proposedBy` (string) |
| `get_proposal` | screening.ts | Get a universe proposal by ID | `id` (string, req) |
| `update_proposal_instrument` | screening.ts | Toggle instrument inclusion in a proposal | `id` (string, req), `instId` (string, req), `included` (bool, req) |
| `add_override_to_proposal` | screening.ts | Add a manual override instrument to a proposal | `id` (string, req), `borsdataInsId` (int, req), `displayName` (string, req), `rationale` (string, req) |
| `remove_override_from_proposal` | screening.ts | Remove a manual override from a proposal | `id` (string, req), `instId` (string, req) |
| `commit_universe` | screening.ts | Commit a proposal, replacing the active universe | `proposalId` (int, req) |

> **Action required:** Register these 13 tools in your agent's available tool list.

## No changes

96 tools unchanged from previous sync.

## Full tool count

Total: **109 tools** across **12 modules** (was 96 tools).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening & universe | 34 |
| research | 5 |
| valuation | 7 |
| ic | 10 |
| portfolio | 7 |
| performance | 9 |
| risk | 10 |
| notifications | 4 |
| platform | 9 |
