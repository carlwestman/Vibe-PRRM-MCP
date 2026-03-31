# PRRM MCP — Change Report

**Date:** 2026-03-31
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
| `get_cash_balances` | portfolio.ts | Get cash balances across currencies | `sub_portfolio_id` (int, optional) |
| `record_deposit` | portfolio.ts | Record a cash deposit | `data` (object) |
| `get_cash_transactions` | portfolio.ts | List cash transactions | `sub_portfolio_id` (int), `currency` (string), `type` (string), `limit` (int), `offset` (int) |
| `record_withdrawal` | portfolio.ts | Record a cash withdrawal | `data` (object) |
| `get_portfolio_config` | portfolio.ts | Get portfolio configuration | none |
| `update_portfolio_config` | portfolio.ts | Update portfolio configuration | `data` (object) |
| `get_dividends` | portfolio.ts | List dividends | `view` (string), `instrument_id` (int), `year` (int) |
| `record_dividend` | portfolio.ts | Record a dividend payment | `data` (object) |
| `sync_dividends` | portfolio.ts | Sync dividends from Borsdata | none |
| `create_import_session` | portfolio.ts | Create a trade import session | none |
| `get_import_session` | portfolio.ts | Get an import session with parsed rows | `id` (string, req) |
| `cancel_import_session` | portfolio.ts | Cancel an import session | `id` (string, req) |
| `commit_import_session` | portfolio.ts | Commit an import session, creating trades | `id` (string, req) |
| `update_import_row` | portfolio.ts | Update a row in an import session | `id` (string, req), `rowId` (string, req), `data` (object) |
| `get_margin_summary` | portfolio.ts | Get margin utilization summary | none |
| `get_realised_pnl` | portfolio.ts | Get realized P&L from closed positions | `sub_portfolio_id` (int), `date_from` (string), `date_to` (string) |
| `list_sub_portfolios` | portfolio.ts | List all sub-portfolios (sleeves) | none |
| `create_sub_portfolio` | portfolio.ts | Create a new sub-portfolio | `data` (object) |

> **Action required:** Register these 18 tools in your agent's available tool list. Note: several write endpoints (deposit, withdrawal, dividend, config, sub-portfolio) have no request body schema defined yet — they accept an optional generic `data` object.

## No changes

127 tools unchanged from previous sync.

## Full tool count

Total: **145 tools** across **12 modules** (was 127 tools).

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
