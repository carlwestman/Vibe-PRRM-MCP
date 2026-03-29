# PRRM MCP — Change Report

**Date:** 2026-03-30
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
| `update_trade` | portfolio.ts | Update an existing trade | `id` (string, req), `instrumentId` (int), `shares` (number), `pricePerShare` (number), `fxRate` (number), `notes` (string) |
| `delete_trade` | portfolio.ts | Delete a trade from the portfolio | `id` (string, req) |
| `get_risk_analytics` | risk.ts | Get portfolio risk metrics (VaR, CVaR, volatility) | `lookback_days` (int, optional) |
| `get_risk_contributions` | risk.ts | Get per-position risk contributions | `lookback_days` (int, optional) |
| `get_correlation_matrix` | risk.ts | Get position correlation matrix | `lookback_days` (int, optional) |
| `run_stress_test` | risk.ts | Run a stress test scenario | `scenario` (string, req), `shocks` (object, req) |

> **Action required:** Register these 6 tools in your agent's available tool list.

## Not implemented

| Endpoint | Reason |
|----------|--------|
| `POST /portfolio/import` (importBrokerCsv) | Uses multipart/form-data file upload — not supported by the MCP JSON transport |

## No changes

121 tools unchanged from previous sync.

## Full tool count

Total: **127 tools** across **12 modules** (was 121 tools).

| Module | Tools |
|--------|-------|
| strategy | 4 |
| instruments | 8 |
| comments | 2 |
| screening & universe | 34 |
| research | 5 |
| valuation | 19 |
| ic | 10 |
| portfolio | 9 |
| performance | 9 |
| risk | 14 |
| notifications | 4 |
| platform | 9 |
