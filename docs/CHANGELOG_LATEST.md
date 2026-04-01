# PRRM MCP — Change Report

**Date:** 2026-04-01
**MCP Package Version:** 0.1.0
**Repo:** https://github.com/carlwestman/Vibe-PRRM-MCP

## How to update

1. Pull the latest version:
   ```bash
   npm install github:carlwestman/Vibe-PRRM-MCP
   # or: cd Vibe-PRRM-MCP && git pull && cd packages/mcp-client && npm install && npm run build
   ```
2. Review the tool changes below and update your agent tool configurations accordingly.

## Removed tools (no API endpoint exists)

| Tool Name | Reason |
|-----------|--------|
| `update_agenda_item` | `PATCH /ic/agenda/{id}` does not exist in the API |
| `remove_agenda_item` | `DELETE /ic/agenda/{id}` does not exist in the API |
| `reorder_agenda_items` | `POST /ic/meetings/{id}/agenda/reorder` does not exist in the API |
| `post_preread` | `POST /ic/prereads` does not exist in the API (returned HTML 404) |

> **Action required:** Remove these 4 tools from your agent's available tool list. They were ghost tools hitting non-existent endpoints.

## Updated tools (parameter changes)

| Tool Name | Change Type | Details |
|-----------|-------------|---------|
| `add_agenda_item` | **breaking** | Restored correct API fields: `instrumentId` (string UUID), `presenter` (string), `order` (number). Removed incorrect `description`, `sortOrder`, `links`. `meetingId` no longer leaks into request body. |
| `record_decision` | **breaking** | Removed `decision` (enum), `instrumentId`, `rationale`, `author`. Now uses `meetingId` (number, req), `text` (string, req), `assignee` (string), `dueDate` (string YYYY-MM-DD) |
| `update_decision_status` | **breaking** | Status enum changed from `pending/executed/cancelled` to `Decided/In Progress/Executed/Reviewed`. Added `note` (string, optional) |
| `post_minutes` | **breaking** | Param is `minutes` (not `body`). Sends `{ minutes }` to API. Removed stale `meetingId`/`author` from request body. |
| `update_minutes` | **breaking** | Now takes minutes record `id` (not meeting_id). Param is `minutes` (not `body`). |
| `list_decisions` | added params | `status`, `meetingId`, `assignee`, `limit`, `offset` — all optional filters |
| `list_ic_meetings` | added params | `status`, `limit`, `offset` — all optional filters |

> **Action required:** Update tool schemas/configs in your agent orchestration. All 7 tools above have parameter changes — 5 are breaking.

## Schema fixes (tool → REST API alignment)

Several tool schemas were rejecting payloads the REST API accepts. These are all **breaking** changes to the MCP tool schemas.

### Screening

| Tool | Fix |
|------|-----|
| `create_screening_profile` | Criteria items: replaced `field` with `metricId`, `calcGroup`, `calc`, and added `valueMax`. `includeFilters` is now required (pass `{}`). `scope` documented as `nordic` or `global`. |
| `update_screening_profile` | Same criteria schema fix as above. |
| `create_intersection_config` | Pipeline items: replaced `z.any()` with discriminated union — `gate` (`type` + `profileId`) and `threshold` (`type` + `profileIds` + `min`). `scoring` now typed as `{ profileWeights: { [profileId]: weight } }`. |
| `update_intersection_config` | Same pipeline/scoring schema fix. |

### Valuation

| Tool | Fix |
|------|-----|
| `execute_valuation` | `inputData` changed from `z.record` to passthrough (`z.any`) — avoids stripping nested model-specific structure. |
| `create_valuation_model` | `template` changed from `z.record` to passthrough — model-type-specific, no MCP-side validation. |
| `update_valuation_model` | Same `template` passthrough fix. |
| `create_scenario` | Replaced opaque `data` wrapper with explicit top-level fields: `name` (req), `modelId` (req), `instrumentId` (req), `inputData`, `description`, `author`. |
| `update_scenario` | Replaced `data` wrapper with explicit fields: `name`, `inputData`, `description`. |
| `compare_scenarios` | Replaced `data` wrapper with `scenarioIds` (string[], req). |
| `export_scenarios_to_ic` | Replaced `data` wrapper with `scenarioIds` (string[], req) + `meetingId` (number, req). |
| `what_if_valuation` | Replaced `data` wrapper with `inputData` (passthrough). |

### IC

| Tool | Fix |
|------|-----|
| `post_minutes` | Param renamed `body` → `minutes` to match API field name. Removed stale `meetingId`/`author` from request body. |
| `update_minutes` | Param renamed `body` → `minutes` to match API. |

> **Action required:** These 14 schema fixes unblock screening, valuation, and IC meeting prep workflows. Update agent tool configs — especially `create_screening_profile` criteria format and all valuation tools that previously used the `data` wrapper pattern.

## No changes

131 tools unchanged.

## Full tool count

Total: **145 tools** across **12 modules** (was 149 — removed 4 ghost tools).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening & universe | 34 |
| research | 5 |
| valuation | 19 |
| ic | 10 |
| portfolio | 27 |
| performance | 9 |
| risk | 14 |
| notifications | 4 |
| platform | 9 |
