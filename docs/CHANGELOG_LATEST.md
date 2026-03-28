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
| `get_strategy_version` | strategy.ts | Get a specific strategy version by ID | `id` (string, required) |
| `add_external_id` | instruments.ts | Add an external identifier to an instrument | `id` (string, req), `source` (string, req), `externalId` (string, req) |
| `remove_external_id` | instruments.ts | Remove an external identifier from an instrument | `id` (string, req), `extId` (string, req) |
| `search_borsdata_instruments` | instruments.ts | Search Borsdata for instruments to import | `q` (string, req, min 2 chars) |
| `search_yahoo_instruments` | instruments.ts | Search Yahoo Finance for instruments to import | `q` (string, req) |
| `delete_screening_profile` | screening.ts | Delete a screening profile | `id` (string, req) |
| `create_instruments_from_screening` | screening.ts | Create instruments from screening run results | `id` (string, req), `resultIds` (number[], req) |
| `update_universe_entry` | screening.ts | Flag or dismiss an instrument in the universe | `id` (string, req), `action` (enum: flag/dismiss, req) |
| `get_performance_summary` | performance.ts | Get portfolio performance summary for a period | `period` (enum: wtd/mtd/qtd/ytd/custom, req), `date_from`, `date_to`, `as_of_date` |
| `get_return_series` | performance.ts | Get portfolio and benchmark return time series | `date_from` (req), `date_to` (req), `interval` (enum: daily/weekly/monthly, req) |
| `get_performance_attribution` | performance.ts | Get performance attribution by position/sector/currency | `date_from` (req), `date_to` (req), `group_by` (enum: position/sector/currency, req) |
| `get_drawdown_analysis` | performance.ts | Get portfolio drawdown analysis | `date_from`, `date_to` (both optional) |
| `get_benchmark_config` | performance.ts | Get the current benchmark configuration | none |
| `set_benchmark` | performance.ts | Set a benchmark instrument for performance comparison | `name` (string, req), `instrumentId` (number, req) |
| `list_performance_reports` | performance.ts | List performance reports | `period` (enum), `date_from`, `date_to`, `limit`, `offset` |
| `create_performance_report` | performance.ts | Create a new performance report | `reportDate` (req), `period` (enum, req), `periodStart` (req), `periodEnd` (req), `author` (req), `body` (req), `metricsSnapshot` |
| `get_performance_report` | performance.ts | Get a specific performance report by ID | `id` (string, req) |
| `get_risk_report` | risk.ts | Get a specific risk report by ID | `id` (string, req) |
| `create_risk_alert_trigger` | risk.ts | Create a new risk alert trigger | `metric` (string, req), `operator` (enum, req), `threshold` (number, req), `enabled` (bool) |
| `update_risk_alert_trigger` | risk.ts | Update an existing risk alert trigger | `id` (req), `metric`, `operator`, `threshold`, `enabled` |
| `delete_risk_alert_trigger` | risk.ts | Delete a risk alert trigger | `id` (string, req) |
| `list_risk_alert_events` | risk.ts | List risk alert events | none |
| `acknowledge_risk_alert_event` | risk.ts | Acknowledge a risk alert event | `id` (req), `acknowledged` (bool, req), `acknowledgedBy` (string) |
| `mark_notification_read` | notifications.ts | Mark a specific notification as read | `id` (string, req) |
| `mark_all_notifications_read` | notifications.ts | Mark all notifications as read | none |
| `health_check` | platform.ts | Check PRRM server health status | none |
| `get_settings` | platform.ts | Get PRRM application settings | none |
| `update_setting` | platform.ts | Update a PRRM application setting | `key` (string, req), `value` (any, req) |
| `get_webhook_config` | platform.ts | Get outbound webhook configuration | none |
| `update_webhook_config` | platform.ts | Update outbound webhook configuration | `url` (string, req), `enabled` (bool, req), `events` (string[], req) |
| `test_webhook` | platform.ts | Send a test webhook | none |

> **Action required:** Register these tools in your agent's available tool list.

## Updated tools (parameter changes)

| Tool Name | Change Type | Details |
|-----------|-------------|---------|
| `search_instruments` | renamed param | `asset_class` renamed to `assetClass` |
| `create_instrument` | renamed param | `name` renamed to `displayName` |
| `create_instrument` | removed param | `isin` was removed |
| `create_instrument` | param now required | `currency` changed from optional to required |
| `create_instrument` | renamed param | `asset_class` renamed to `assetClass` |
| `create_instrument` | added params | `status` (enum), `tags` (string[]), `externalIds` (array) |
| `update_instrument` | renamed param | `name` renamed to `displayName`, `asset_class` to `assetClass` |
| `update_instrument` | removed param | `isin` was removed |
| `update_instrument` | added param | `tags` (string[]) |
| `add_comment` | removed param | `parent_id` was removed |
| `add_comment` | changed param | `author` changed from required to optional |
| `create_screening_profile` | renamed param | `universe` renamed to `scope` (now required) |
| `create_screening_profile` | schema change | criteria items: `kpi` renamed to `field`, `value` type changed from number to any |
| `create_screening_profile` | added params | `includeFilters`, `excludeFilters` |
| `update_screening_profile` | same changes | mirrors create_screening_profile changes |
| `get_universe` | renamed param | `flagged`/`dismissed` replaced with `flagged_only` |
| `get_universe` | added params | `limit`, `offset` for pagination |
| `list_research_reports` | removed params | `instrument_id`, `author`, `conviction` removed |
| `create_research_report` | renamed param | `instrument_id` renamed to `instrumentId` (now number, required) |
| `create_research_report` | removed params | `conviction`, `target_price` removed |
| `create_research_report` | added param | `status` (string, optional) |
| `update_research_report` | removed params | `conviction`, `target_price` removed |
| `create_valuation_model` | renamed param | `schema` renamed to `template` (now required) |
| `create_valuation_model` | added params | `author` (string, optional); `type` now enum: dcf/comparables/ddm/nav/custom |
| `update_valuation_model` | renamed param | `schema` renamed to `template` |
| `update_ic_meeting` | renamed tool | was `update_meeting_status`, now `update_ic_meeting` |
| `update_ic_meeting` | added param | `meetingDate` (string, optional) |
| `create_ic_meeting` | renamed param | `meeting_date` renamed to `meetingDate` |
| `list_ic_meetings` | removed params | `status`, `limit`, `offset` removed (API takes no query params) |
| `add_agenda_item` | renamed param | `instrument_id` renamed to `instrumentId` (now number) |
| `add_agenda_item` | removed params | `type`, `research_id`, `notes` removed |
| `add_agenda_item` | added param | `order` (number, optional) |
| `post_minutes` | renamed param | `body` renamed to `minutes` |
| `post_minutes` | removed param | `author` removed |
| `update_minutes` | renamed param | `body` renamed to `minutes` |
| `update_minutes` | removed param | `id` (minutes record ID) removed |
| `record_decision` | breaking change | `meeting_id`/`text`/`assignee`/`due_date` replaced with `meetingId` (number), `decision` (enum: approve/reject/defer/modify), `instrumentId`, `rationale`, `author` |
| `update_decision_status` | enum change | status enum changed from `pending/in_progress/completed/cancelled` to `pending/executed/cancelled` |
| `update_decision_status` | removed param | `note` removed |
| `list_decisions` | removed params | `status`, `meeting_id`, `assignee`, `limit`, `offset` removed |
| `register_trade` | breaking change | `instrument_id`/`side`/`quantity`/`price`/`trade_date`/`currency` replaced with `instrumentId` (number), `tradeType` (enum), `shares` (number), `pricePerShare` (number), `tradeDate` (string, req), `currency` (string, req) |
| `register_trade` | removed params | `settlement_date`, `broker`, `notes` removed |
| `register_trade` | added param | `fxRate` (number, optional) |
| `list_risk_reports` | removed params | `limit`, `offset` removed |
| `get_portfolio.position` | renamed param | `instrument_id` renamed to `instrumentId` |
| `get_trade_history` | renamed param | `instrument_id` renamed to `instrumentId` |

> **Action required:** Update tool schemas/configs in your agent orchestration to match the new signatures. Pay special attention to `register_trade` and `record_decision` which have breaking parameter changes.

## Removed tools

| Tool Name | Was In Module | Replacement |
|-----------|---------------|-------------|
| `recalculate_positions` | portfolio.ts | Use `trigger_daily_update` instead |
| `snapshot_portfolio` | portfolio.ts | Use `trigger_daily_update` instead |
| `link_valuation_to_research` | research.ts | No replacement (endpoint never existed) |
| `link_valuation_to_report` | valuation.ts | No replacement (duplicate of above) |
| `record_alert_event` | risk.ts | Use `acknowledge_risk_alert_event` for existing events |
| `get_risk_decomposition` | risk.ts | No replacement (endpoint does not exist) |
| `get_holdings_for_optimizer` | risk.ts | No replacement (endpoint does not exist) |
| `update_agenda_item` | ic.ts | No replacement (endpoint does not exist) |
| `remove_agenda_item` | ic.ts | No replacement (endpoint does not exist) |
| `reorder_agenda_items` | ic.ts | No replacement (endpoint does not exist) |
| `post_preread` | ic.ts | No replacement (endpoint does not exist) |
| `suggest_alert_change` | risk.ts | Renamed to `create_risk_alert_trigger` with different params |

> **Action required:** Remove these tools from your agent's available tool list. Replace `suggest_alert_change` with `create_risk_alert_trigger`.

## Full tool count

Total: **87 tools** across **12 modules** (was 68 tools across 11 modules).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening | 12 |
| research | 5 |
| valuation | 7 |
| ic | 10 |
| portfolio | 7 |
| performance | 9 |
| risk | 10 |
| notifications | 4 |
| platform | 9 |
