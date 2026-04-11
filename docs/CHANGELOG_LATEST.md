# PRRM MCP — Tool Reduction Refactor

**Date:** 2026-04-11
**MCP Package Version:** 0.1.0
**Repo:** https://github.com/carlwestman/Vibe-PRRM-MCP
**Tool count:** 166 → 136 registered

## Why this refactor

OpenRouter `auto` enforces a hard 200-tool cap per request. With PRRM at 166 tools plus
Borsdata (30), Yahoo (9), portfolio-optimizer (7), and OpenClaw core (~16), agents were
hitting `Maximum tools limit reached. 228 tools have been provided but the maximum is 200`
and failing every request. This refactor brings PRRM down to 136 — total ~198, with
~2 tools of headroom under the cap.

**Goal: zero capability loss.** Every workflow is still reachable. Most cuts are merges
(get_X folded into list_X via an optional `id` param), not removals.

## Removed tools (bare list)

### Merged into list_X (call list_X with id instead)

- `get_ic_meeting` → use `list_ic_meetings({id})`
- `get_intersection_config` → use `list_intersection_configs({id})`
- `get_intersection_run` → use `list_intersection_runs({runId})`
- `get_preread` → use `list_prereads({prereadId, meetingId, itemId})`
- `get_research_report` → use `list_research_reports({id})`
- `get_risk_report` → use `list_risk_reports({id})`
- `get_scenario` → use `list_scenarios({id})`
- `get_screening_profile` → use `list_screening_profiles({id})`
- `get_strategy_version` → use `get_strategy({versionId})`
- `get_sub_portfolio` → use `list_sub_portfolios({id})`
- `get_sub_portfolio_summary` → use `list_sub_portfolios({summary: true})`
- `get_universe_version` → use `list_universe_versions({id})`
- `get_current_universe` → use `get_universe({})` (no params returns active universe)
- `get_valuation_output` → use `list_valuations_by_instrument({id})`
- `get_performance_report` → use `list_performance_reports({id})`
- `get_valuation_model` → use `list_valuation_models({id})`

### Deleted outright (no replacement)

- `execute_valuation` — endpoint returned HTTP 500 on every call. Use `create_scenario` → `execute_scenario` (or `what_if_valuation` for non-persistent runs).
- `health_check` — ops tool, agents don't need it.
- `trigger_daily_update` — admin-only scheduled job.
- `get_tool_catalog` — was the only self-introspection tool. Agents lose this capability; the MCP `tools/list` protocol path is not exposed by OpenClaw, so there is **no replacement**.
- `get_settings` — admin platform config.
- `update_setting` — admin platform config.
- `get_webhook_config` — admin webhook plumbing.
- `update_webhook_config` — admin webhook plumbing.
- `test_webhook` — admin webhook plumbing.
- `create_import_session` — bulk-import session admin flow; UI-only workflow.
- `get_import_session` — bulk-import session admin flow.
- `cancel_import_session` — bulk-import session admin flow.
- `commit_import_session` — bulk-import session admin flow.
- `update_import_row` — bulk-import session admin flow.

## Renamed tools

| Old name | New name | Reason |
|---|---|---|
| `run_stress_test` | `run_prrm_stress_test` | Collides with portfolio-optimizer MCP's `run_stress_test`. The bundle-mcp loader silently dropped PRRM's version on collision (portopt won), so PRRM's stress test was unreachable. Rename matches the existing `search_prrm_instruments` pattern. |

## Merged tools

### `list_ic_meetings`
- **New signature:** `list_ic_meetings({status?, limit?, offset?, id?})`
- **Replaces:** `get_ic_meeting`
- **Migration:** `get_ic_meeting(42)` → `list_ic_meetings({id: "42"})`. Same `ICMeeting` shape either way.

### `list_intersection_configs`
- **New signature:** `list_intersection_configs({id?})`
- **Replaces:** `get_intersection_config`
- **Migration:** `get_intersection_config(id)` → `list_intersection_configs({id})`. Same shape.

### `list_intersection_runs` — DUAL ID PARAM
- **New signature:** `list_intersection_runs({configId?, runId?})`
- **Replaces:** `get_intersection_run`
- **Migration:** `get_intersection_run("run_42")` → `list_intersection_runs({runId: "run_42"})`.
- **NOTE:** exactly one of `configId` or `runId` must be provided. If both are set, `runId` wins. The two paths hit different endpoints (`/screening/intersection-runs/{runId}` vs `/screening/intersections/{configId}/runs`).

### `list_prereads`
- **New signature:** `list_prereads({meetingId, itemId, prereadId?})`
- **Replaces:** `get_preread`
- **Migration:** `get_preread(meetingId, itemId, prereadId)` → `list_prereads({meetingId, itemId, prereadId})`. `meetingId` and `itemId` are still required because pre-reads are nested under agenda items in the API.

### `list_research_reports` — POLYMORPHIC RETURN
- **New signature:** `list_research_reports({type?, status?, recommendation?, limit?, offset?, id?})`
- **Replaces:** `get_research_report`
- **Migration:** `get_research_report("rpt_123")` → `list_research_reports({id: "rpt_123"})`.
- **WARNING:** response shape differs based on whether `id` is set:
  - Without `id`: `[{...}, {...}]` (array of `ResearchReport`)
  - With `id`: bare `{id, title, body, instrumentIds, ...}` (single `ResearchReport`)

### `list_risk_reports`
- **New signature:** `list_risk_reports({type?, limit?, offset?, id?})`
- **Replaces:** `get_risk_report`
- **Migration:** `get_risk_report(id)` → `list_risk_reports({id})`. Same `RiskReport` shape.

### `list_scenarios`
- **New signature:** `list_scenarios({instrumentId?, id?})`
- **Replaces:** `get_scenario`
- **Migration:** `get_scenario("sc_42")` → `list_scenarios({id: "sc_42"})`.
- **NOTE:** previously `list_scenarios` required `instrumentId`. Now either `instrumentId` (list mode) or `id` (single-fetch mode) must be provided. If both are set, `id` wins.

### `list_screening_profiles`
- **New signature:** `list_screening_profiles({id?})`
- **Replaces:** `get_screening_profile`
- **Migration:** `get_screening_profile(id)` → `list_screening_profiles({id})`. Same `ScreeningProfile` shape.

### `list_universe_versions` — POLYMORPHIC WRAPPER
- **New signature:** `list_universe_versions({id?})`
- **Replaces:** `get_universe_version`
- **Migration:** `get_universe_version(id)` → `list_universe_versions({id})`.
- **WARNING:** response shape differs:
  - Without `id`: `{data: [...], ...}` (wrapped — the api-client does NOT unwrap this list endpoint because the server returns the wrapper inside its envelope)
  - With `id`: bare version object `{id, ...}`

### `list_valuation_models`
- **New signature:** `list_valuation_models({id?})`
- **Replaces:** `get_valuation_model`
- **Migration:** `get_valuation_model(id)` → `list_valuation_models({id})`. Same `ValuationModel` shape.

### `list_valuations_by_instrument`
- **New signature:** `list_valuations_by_instrument({instrument_id?, id?})`
- **Replaces:** `get_valuation_output`
- **Migration:** `get_valuation_output("vo_5")` → `list_valuations_by_instrument({id: "vo_5"})`.
- **NOTE:** provide either `instrument_id` (list mode) or `id` (single-fetch mode). If both are set, `id` wins.

### `list_performance_reports` — POLYMORPHIC RETURN
- **New signature:** `list_performance_reports({period?, date_from?, date_to?, limit?, offset?, id?})`
- **Replaces:** `get_performance_report`
- **Migration:** `get_performance_report(id)` → `list_performance_reports({id})`.
- **WARNING:** response shape differs:
  - Without `id`: array of `PerformanceReport` (post-unwrap)
  - With `id`: bare single `PerformanceReport` object

### `get_strategy` — FIELD DIFFERENCE
- **New signature:** `get_strategy({versionId?})`
- **Replaces:** `get_strategy_version`
- **Migration:** `get_strategy_version("v3")` → `get_strategy({versionId: "v3"})`.
- **WARNING:** when `versionId` is set, the response is a `StrategyVersion` which is missing `updatedAt` (and possibly other fields) compared to the current `Strategy` shape. Code reading `updatedAt` from a historical version will get `undefined`.

### `get_universe`
- **New signature:** `get_universe({flagged_only?, limit?, offset?})`
- **Replaces:** `get_current_universe`
- **Migration:** `get_current_universe()` → `get_universe({})`. Calling `get_universe` with no params already returned the active universe; the separate `get_current_universe` was redundant.

### `list_sub_portfolios` — TRIPLE MODE
- **New signature:** `list_sub_portfolios({id?, summary?})`
- **Replaces:** `get_sub_portfolio`, `get_sub_portfolio_summary`
- **Migration:**
  - `get_sub_portfolio("sp_1")` → `list_sub_portfolios({id: "sp_1"})`
  - `get_sub_portfolio_summary()` → `list_sub_portfolios({summary: true})`
  - List all → `list_sub_portfolios({})`
- **WARNING:** the `summary: true` mode returns aggregated metrics across all sub-portfolios — this is a **different shape** than the per-sub-portfolio detail you get from `{id}` or the array from `{}`.

## Polymorphic-return tools (special handling required)

These tools return different shapes based on whether `id` is set. Agents MUST handle both:

- `list_research_reports` — array vs bare object
- `list_performance_reports` — array vs bare object
- `list_universe_versions` — wrapped `{data: [...]}` vs bare object
- `list_sub_portfolios` — array vs bare object vs aggregated summary

## Field-difference tools (silent shape changes)

These tools may return different fields based on params:

- `get_strategy({versionId})` — `StrategyVersion` lacks `updatedAt`
- `list_sub_portfolios({summary: true})` — returns aggregated metrics, not the per-portfolio detail shape

## Known API issues (route around these)

- `execute_valuation` (now removed) — returned HTTP 500 on every call. Use `create_scenario` → `execute_scenario` for persistent valuation runs, or `what_if_valuation` for disposable analysis.

## Math

| Module | Before | After | Change |
|---|---|---|---|
| strategy | 4 | 3 | −1 (merged version) |
| instruments | 8 | 8 | — |
| comments | 2 | 2 | — |
| screening | 37 | 32 | −5 (merged 4, consolidated universe) |
| research | 5 | 4 | −1 (merged) |
| valuation | 19 | 15 | −4 (merged 3, removed broken) |
| ic | 18 | 16 | −2 (merged) |
| portfolio | 37 | 30 | −7 (merged 2, removed 5 import-session) |
| performance | 9 | 8 | −1 (merged) |
| risk | 14 | 13 | −1 (merged) |
| notifications | 4 | 4 | — |
| platform | 9 | 1 | −8 (removed admin tools) |
| **Total** | **166** | **136** | **−30** |

Plus 1 rename: `run_stress_test` → `run_prrm_stress_test` (no count change, but unblocks the previously-shadowed tool).

## How to update

```bash
cd Vibe-PRRM-MCP && git pull && cd packages/mcp-client && npm install && npm run build
```

Then **restart your MCP client session** — tool descriptions are cached at session-init and never refreshed live. Without a restart, agents will see the old tool list and call removed tools, getting "tool not found" errors.

## Migration checklist for agents

1. Replace every `get_X(id)` call with `list_X({id})` per the table above. The merged tool returns the same shape for the single-fetch path **except** for the polymorphic-return cases listed above.
2. Stop calling `execute_valuation`. Use `create_scenario` → `execute_scenario`.
3. If you were using `get_tool_catalog` for self-introspection — there is no replacement. Agents must rely on the tool list provided at session start.
4. Update any references to `run_stress_test` in PRRM-context to `run_prrm_stress_test`. (The portfolio-optimizer's `run_stress_test` is unaffected.)
5. For polymorphic-return tools (`list_research_reports`, `list_performance_reports`, `list_universe_versions`, `list_sub_portfolios`), branch on the response type (array vs object) before parsing.
