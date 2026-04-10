# PRRM MCP — Change Report

**Date:** 2026-04-11
**MCP Package Version:** 0.1.0
**Repo:** https://github.com/carlwestman/Vibe-PRRM-MCP

## 2026-04-11 — Hotfixes (research + valuation)

### Critical fixes verified against live API

| Tool | Issue | Fix |
|------|-------|-----|
| `create_research_report` | `instrumentId` (singular string) was silently ignored — instruments never linked | Renamed to `instrumentIds` (array of integers). Added `targetPrice`, `timeHorizon`, `conviction`, `riskRating`. |
| `update_research_report` | Missing fields — couldn't update recommendation, status, target price, etc. | Added `instrumentIds` (mutable), `targetPrice`, `timeHorizon`, `conviction`, `riskRating`. |
| `create_research_report` / `update_research_report` | `recommendation` enum was lowercase (`buy/hold/sell/under_review`), API rejected all values | Corrected to API enum: `Buy / Hold / Sell / No Rating` |
| `create_research_report` / `update_research_report` | `status` enum was lowercase 4 values (`draft/review/published/archived`), API rejected all | Corrected to API enum: `Draft / Published / Archived` (3 values, no "review") |
| `create_scenario` | `inputData` and `author` were marked optional but API requires both — every call failed with "Invalid request data" | Both fields now required in the schema. |
| `create_scenario` | Description didn't explain that `autofill_valuation.inputs` (not the whole response) is what goes into `inputData` | Description now warns explicitly: pass `autofill.inputs`, NOT the `{inputs, sources}` wrapper. |
| `autofill_valuation` | Tool description didn't document the `{inputs, sources}` return shape | Description now documents the response shape and where to unwrap. |
| `execute_valuation` | Returns HTTP 500 "An unexpected error occurred" on every call (API-side bug) | Description now flags as unstable and points to the `create_scenario` → `execute_scenario` workflow as the recommended path. |

### Verification

All fixes were validated by reproducing failures end-to-end against the live API, then confirming success after the fix. The OpenAPI spec is stale on enum values — fixes were derived from actual API validation error responses.

### Action required for agents

1. **Research reports**: Use `instrumentIds: [1, 42]` (plural array of integers), not `instrumentId`. Use Title-cased enum values (`Buy`, `Draft`, etc.).
2. **Valuation scenarios**: Always pass `inputData` and `author`. When using autofill, pass `autofill.inputs` — not the whole response.
3. **Don't use `execute_valuation`** — use `create_scenario` → `execute_scenario` instead.

---

## 2026-04-01 — Initial full sync

## How to update

1. Pull the latest version:
   ```bash
   npm install github:carlwestman/Vibe-PRRM-MCP
   # or: cd Vibe-PRRM-MCP && git pull && cd packages/mcp-client && npm install && npm run build
   ```
2. Review the tool changes below and update your agent tool configurations accordingly.

## Critical fixes

These tools were completely broken (wrong schemas, wrong field names, wrong enum values). Every call from an agent would fail or produce incorrect behavior.

| Tool Name | Issue | Fix |
|-----------|-------|-----|
| `record_decision` | Entirely wrong schema — was sending `text`, `assignee`, `dueDate` instead of `decision`, `rationale`, `author` | Reverted to API schema: `meetingId` (string, req), `decision` (enum: approve/reject/defer/modify, req), `instrumentId` (string, opt), `rationale` (string, opt), `author` (string, opt) |
| `update_decision_status` | Wrong enum values (Decided/In Progress/Executed/Reviewed) and extra `note` field | Reverted to API schema: `status` (enum: pending/executed/cancelled, opt). Removed `note`. |
| `create_research_report` | `instrumentId` was number (should be string), `type` accepted free text (should be enum), `author` was required (should be optional) | `instrumentId` → string. `type` → enum: "Instrument Research", "Thematic", "Sector", "Macro", "Ad-Hoc", "Other". `author` → optional. Added `recommendation` enum (buy/hold/sell/under_review) and `status` enum (draft/review/published/archived). |
| `register_trade` | `instrumentId` was number, API expects string | `instrumentId` → string |
| `create_instrument` | Enum values were Title Case (Active/Inactive/Delisted), API expects lowercase | `assetClass` → enum: equity, fixed_income, commodity, fx, crypto, other. `status` → enum: active, inactive, delisted. |
| `update_instrument` | Same enum case mismatch | Same fix as `create_instrument` |
| `publish_risk_report` | `type` accepted free text, `author` was required | `type` → enum: daily, weekly, ad_hoc. `author` → optional. |
| `update_ic_meeting` | `status` accepted any string | `status` → enum: scheduled, in_progress, completed, cancelled |

> **Action required:** These 8 tools have completely new schemas. Update all agent tool configurations. The `record_decision` and `update_decision_status` changes are the most impactful — agents must use the new field names and enum values.

## Restored tools (previously removed, now with correct routes)

These tools were removed in the 2026-03-31 update because they returned 404. The root cause was incorrect API routes — the tools were hitting flat paths like `/ic/agenda/{id}` instead of nested paths like `/ic/meetings/{meetingId}/agenda/{itemId}`. They have been restored with the correct routes.

### IC Agenda management (3 restored tools)

| Tool Name | Route | Parameters |
|-----------|-------|------------|
| `update_agenda_item` | `PATCH /ic/meetings/{meetingId}/agenda/{itemId}` | `meetingId` (number, req), `itemId` (number, req), `title` (string, opt), `description` (string, opt), `sortOrder` (number, opt) |
| `remove_agenda_item` | `DELETE /ic/meetings/{meetingId}/agenda/{itemId}` | `meetingId` (number, req), `itemId` (number, req) |
| `reorder_agenda_items` | `POST /ic/meetings/{meetingId}/agenda/reorder` | `meetingId` (number, req), `orderedIds` (number[], req) |

### IC Pre-reads (5 new tools)

| Tool Name | Route | Parameters |
|-----------|-------|------------|
| `list_prereads` | `GET /ic/meetings/{meetingId}/agenda/{itemId}/prereads` | `meetingId` (number, req), `itemId` (number, req) |
| `post_preread` | `POST /ic/meetings/{meetingId}/agenda/{itemId}/prereads` | `meetingId` (number, req), `itemId` (number, req), `title` (string, req), `body` (string, req), `author` (string, opt) |
| `get_preread` | `GET /ic/meetings/{meetingId}/agenda/{itemId}/prereads/{prereadId}` | `meetingId` (number, req), `itemId` (number, req), `prereadId` (number, req) |
| `update_preread` | `PATCH /ic/meetings/{meetingId}/agenda/{itemId}/prereads/{prereadId}` | `meetingId` (number, req), `itemId` (number, req), `prereadId` (number, req), `title` (string, opt), `body` (string, opt), `author` (string, opt) |
| `delete_preread` | `DELETE /ic/meetings/{meetingId}/agenda/{itemId}/prereads/{prereadId}` | `meetingId` (number, req), `itemId` (number, req), `prereadId` (number, req) |

> **Action required:** Register these 8 tools. Note that all IC agenda and pre-read tools require `meetingId` — agents must look up the meeting ID first (via `list_ic_meetings` or `get_ic_meeting`).

## New tools added

### Screening & Universe (3 tools)

| Tool Name | Route | Description | Parameters |
|-----------|-------|-------------|------------|
| `evaluate_instrument_against_profile` | `GET /screening/profiles/{id}/evaluate/{instrumentId}` | Evaluate a single instrument against a screening profile's criteria | `profileId` (string, req), `instrumentId` (string, req) |
| `create_universe_override` | `POST /universe/overrides` | Add a manual override instrument directly to the universe | `displayName` (string, req), `rationale` (string, req), `ticker`, `assetClass`, `sector`, `country`, `exchange`, `currency`, `borsdataInsId`, `borsdataUrlName`, `instrumentId`, `externalIds` (all opt) |
| `bulk_create_instruments` | `POST /universe/bulk-create-instruments` | Bulk-create instruments from a universe version's instrument list | `versionInstrumentIds` (number[], req) |

### Portfolio (10 tools)

| Tool Name | Route | Description | Parameters |
|-----------|-------|-------------|------------|
| `update_position_price` | `PATCH /portfolio/positions/{instrumentId}` | Update the price on a portfolio position | `instrumentId` (string, req), `price` (number, req), `priceDate` (string, opt) |
| `assign_position_sleeve` | `PATCH /portfolio/positions/{instrumentId}/sleeve` | Assign a position to a sub-portfolio sleeve | `instrumentId` (string, req), `subPortfolioId` (number, opt — omit to unassign) |
| `import_portfolio` | `POST /portfolio/import` | Import portfolio data (CSV/broker file upload) | `data` (any, req — passthrough) |
| `import_transactions` | `POST /portfolio/import/transactions` | Import transactions from an external source | `data` (any, req), `dry_run` (boolean, opt), `sub_portfolio_id` (number, opt) |
| `update_cash_transaction` | `PATCH /portfolio/cash/transactions/{id}` | Update a cash transaction | `id` (string, req), `type` (enum: deposit/withdrawal/margin_draw/margin_repay, opt), `amount`, `currency`, `fxRate`, `date`, `notes` (all opt) |
| `delete_cash_transaction` | `DELETE /portfolio/cash/transactions/{id}` | Delete a cash transaction | `id` (string, req) |
| `get_sub_portfolio_summary` | `GET /portfolio/sub-portfolios/summary` | Get summary metrics for all sub-portfolios | (none) |
| `get_sub_portfolio` | `GET /portfolio/sub-portfolios/{id}` | Get a specific sub-portfolio by ID | `id` (string, req) |
| `update_sub_portfolio` | `PATCH /portfolio/sub-portfolios/{id}` | Update a sub-portfolio | `id` (string, req), `name` (string, opt), `description` (string, opt), `sortOrder` (number, opt) |
| `delete_sub_portfolio` | `DELETE /portfolio/sub-portfolios/{id}` | Delete a sub-portfolio | `id` (string, req) |

> **Action required:** Register these 13 new tools in your agent's available tool list.

## Updated tools (parameter changes)

### Portfolio data wrapper fixes

These tools previously used an opaque `data: z.record(z.any())` parameter. Agents had to guess the field names. They now have explicit, typed parameters.

| Tool Name | Change | New Parameters |
|-----------|--------|----------------|
| `record_deposit` | **breaking** — replaced `data` | `amount` (number, req), `currency` (string, req), `date` (string, req), `fxRate` (number, opt), `subPortfolioId` (number, opt), `notes` (string, opt) |
| `record_withdrawal` | **breaking** — replaced `data` | Same as `record_deposit` (amount is positive, API negates it) |
| `record_dividend` | **breaking** — replaced `data` | `instrumentId` (number, req), `exDate` (string, req), `amountPerShare` (number, req), `currency` (string, req), `payDate` (string, opt), `fxRate` (number, opt), `subPortfolioId` (number, opt), `notes` (string, opt) |
| `create_sub_portfolio` | **breaking** — replaced `data` | `name` (string, req), `description` (string, opt) |
| `update_portfolio_config` | **breaking** — replaced `data` | `name` (string, opt), `baseCurrency` (string, opt), `marginLimit` (number, opt) |

### IC decision filter changes

| Tool Name | Change | Details |
|-----------|--------|---------|
| `list_decisions` | removed param | `assignee` filter removed — not in API. Status filter updated to `pending/executed/cancelled`. |

> **Action required:** Update all 6 tool schemas above. The portfolio tools are the biggest change — agents that were passing `{data: {amount: 100, ...}}` must now pass `{amount: 100, ...}` at the top level.

## No changes

~110 tools unchanged and verified working.

## Full tool count

Total: **166 tools** across **12 modules** (was 145).

| Module | Tools | Change |
|--------|-------|--------|
| strategy | 4 | — |
| instruments | 8 | enum fixes |
| comments | 2 | — |
| screening & universe | 37 | +3 new |
| research | 5 | schema fix |
| valuation | 19 | — |
| ic | 18 | +8 restored, schema fixes |
| portfolio | 37 | +10 new, 5 schema fixes |
| performance | 9 | — |
| risk | 14 | schema fix |
| notifications | 4 | — |
| platform | 9 | — |
