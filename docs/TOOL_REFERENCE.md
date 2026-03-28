# PRRM MCP Tool Reference

Complete reference for all 68 tools exposed by the `@wsvc/prrm-mcp` server, organized by module. Every tool maps to a PRRM REST API endpoint under `/api/v1/`.

All parameters are validated with Zod schemas before the API call is made. Tool results are returned as JSON text content. Errors are never thrown -- they are returned as text so the agent can read and react to them.

---

## Table of Contents

- [Strategy](#strategy)
- [Instruments](#instruments)
- [Comments](#comments)
- [Screening](#screening)
- [Research](#research)
- [Valuation](#valuation)
- [Investment Committee](#investment-committee)
- [Portfolio](#portfolio)
- [Risk](#risk)
- [Notifications](#notifications)
- [Platform](#platform)
- [Error Handling](#error-handling)
- [MCP Resources](#mcp-resources)

---

## Strategy

### `get_strategy`

Get the current investment strategy document.

**Parameters:** None

**Endpoint:** `GET /api/v1/strategy`

---

### `get_strategy_versions`

Get all versions of the investment strategy document.

**Parameters:** None

**Endpoint:** `GET /api/v1/strategy/versions`

---

### `update_strategy`

Update the investment strategy document with new content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | The full updated strategy content in markdown |
| `author` | string | Yes | Name of the person making the update |

**Endpoint:** `PUT /api/v1/strategy`
**Body:** `{ content, author }`

---

## Instruments

### `search_instruments`

Search for instruments by name, asset class, status, or sector.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Search query string |
| `asset_class` | string | No | Filter by asset class (e.g. equity, fixed_income) |
| `status` | string | No | Filter by status (e.g. active, watchlist, excluded) |
| `sector` | string | No | Filter by sector |
| `limit` | number | No | Max results to return |
| `offset` | number | No | Offset for pagination |

**Endpoint:** `GET /api/v1/instruments`
**Query params:** `q, asset_class, status, sector, limit, offset`

---

### `get_instrument`

Get detailed information about a specific instrument by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The instrument ID |

**Endpoint:** `GET /api/v1/instruments/{id}`

---

### `create_instrument`

Create a new instrument in the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Instrument name |
| `ticker` | string | No | Ticker symbol |
| `isin` | string | No | ISIN code |
| `asset_class` | string | Yes | Asset class (e.g. equity, fixed_income, commodity) |
| `currency` | string | No | Currency code (e.g. USD, EUR) |
| `sector` | string | No | Sector classification |
| `country` | string | No | Country of domicile |
| `exchange` | string | No | Primary exchange |

**Endpoint:** `POST /api/v1/instruments`
**Body:** All fields

---

### `update_instrument`

Update fields on an existing instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The instrument ID to update |
| `name` | string | No | Updated name |
| `ticker` | string | No | Updated ticker |
| `isin` | string | No | Updated ISIN |
| `asset_class` | string | No | Updated asset class |
| `currency` | string | No | Updated currency |
| `sector` | string | No | Updated sector |
| `country` | string | No | Updated country |
| `exchange` | string | No | Updated exchange |
| `status` | string | No | Updated status |

**Endpoint:** `PATCH /api/v1/instruments/{id}`
**Body:** All fields except `id`

---

## Comments

Comments are accessed through the parent entity's endpoint. The `entity_type` parameter determines the base path:
- `entity_type: "instrument"` uses `/instruments/{id}/comments`
- `entity_type: "research"` uses `/research/{id}/comments`

### `get_comments`

Get comments for an instrument or research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | enum: `"instrument"`, `"research"` | Yes | Type of parent entity |
| `entity_id` | string | Yes | ID of the parent entity |

**Endpoint:** `GET /api/v1/instruments/{entity_id}/comments` or `GET /api/v1/research/{entity_id}/comments`

---

### `add_comment`

Add a comment to an instrument or research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | enum: `"instrument"`, `"research"` | Yes | Type of parent entity |
| `entity_id` | string | Yes | ID of the parent entity |
| `body` | string | Yes | Comment text |
| `author` | string | Yes | Name of the commenter |
| `parent_id` | string | No | ID of parent comment for threaded replies |

**Endpoint:** `POST /api/v1/instruments/{entity_id}/comments` or `POST /api/v1/research/{entity_id}/comments`
**Body:** `{ body, author, parent_id }`

---

## Screening

### `list_screening_profiles`

List all screening profiles.

**Parameters:** None

**Endpoint:** `GET /api/v1/screening/profiles`

---

### `get_screening_profile`

Get a specific screening profile by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Screening profile ID |

**Endpoint:** `GET /api/v1/screening/profiles/{id}`

---

### `create_screening_profile`

Create a new screening profile with criteria and thresholds.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Profile name |
| `description` | string | No | Profile description |
| `criteria` | array of objects | Yes | Screening criteria. Each object: `{ kpi: string, operator: string, value: number }`. Operator is one of: gt, lt, gte, lte, eq |
| `universe` | string | No | Universe to screen against |

**Endpoint:** `POST /api/v1/screening/profiles`
**Body:** All fields

---

### `update_screening_profile`

Update an existing screening profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Profile ID to update |
| `name` | string | No | Updated name |
| `description` | string | No | Updated description |
| `criteria` | array of objects | No | Updated criteria (same format as create) |
| `universe` | string | No | Updated universe |

**Endpoint:** `PATCH /api/v1/screening/profiles/{id}`
**Body:** All fields except `id`

---

### `run_screen`

Execute a screening profile to find matching instruments.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | Yes | Screening profile ID to run |

**Endpoint:** `POST /api/v1/screening/profiles/{profileId}/run`

---

### `get_screen_results`

Get results from a completed screening run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `runId` | string | Yes | Screening run ID |

**Endpoint:** `GET /api/v1/screening/runs/{runId}/results`

---

### `get_available_kpis`

Get available KPIs for screening criteria.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by KPI category |
| `q` | string | No | Search query for KPI names |

**Endpoint:** `GET /api/v1/screening/kpis`
**Query params:** `category, q`

---

### `get_screening_classifications`

Get available screening classifications.

**Parameters:** None

**Endpoint:** `GET /api/v1/screening/classifications`

---

### `get_universe`

Get the instrument universe with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `flagged` | boolean | No | Filter to flagged instruments only |
| `dismissed` | boolean | No | Filter to dismissed instruments only |

**Endpoint:** `GET /api/v1/universe`
**Query params:** `flagged, dismissed`

---

## Research

### `list_research_reports`

List research reports with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Report type filter |
| `status` | string | No | Report status filter |
| `instrument_id` | string | No | Filter by instrument ID |
| `author` | string | No | Filter by author |
| `recommendation` | string | No | Filter by recommendation (buy, sell, hold) |
| `conviction` | string | No | Filter by conviction level |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

**Endpoint:** `GET /api/v1/research`
**Query params:** `type, status, instrument_id, author, recommendation, conviction, limit, offset`

---

### `get_research_report`

Get a specific research report by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Research report ID |

**Endpoint:** `GET /api/v1/research/{id}`

---

### `create_research_report`

Create a new research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Report title |
| `type` | string | Yes | Report type (e.g. initiation, update, note) |
| `instrument_id` | string | No | Associated instrument ID |
| `author` | string | Yes | Report author |
| `body` | string | Yes | Report content in markdown |
| `recommendation` | string | No | Investment recommendation (buy, sell, hold) |
| `conviction` | string | No | Conviction level (high, medium, low) |
| `target_price` | number | No | Target price |

**Endpoint:** `POST /api/v1/research`
**Body:** All fields

---

### `update_research_report`

Update an existing research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Report ID to update |
| `title` | string | No | Updated title |
| `body` | string | No | Updated body content |
| `status` | string | No | Updated status |
| `recommendation` | string | No | Updated recommendation |
| `conviction` | string | No | Updated conviction |
| `target_price` | number | No | Updated target price |

**Endpoint:** `PATCH /api/v1/research/{id}`
**Body:** All fields except `id`

---

### `link_valuation_to_research`

Link a valuation output to a research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report_id` | string | Yes | Research report ID |
| `valuation_output_id` | string | Yes | Valuation output ID to link |

**Endpoint:** `POST /api/v1/research/{report_id}/link-valuation`
**Body:** `{ valuation_output_id }`

---

### `search_research_semantic`

Semantic search across research reports.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `limit` | number | No | Max results to return |

**Endpoint:** `POST /api/v1/research/search`
**Body:** `{ query, limit }`

---

## Valuation

### `list_valuation_models`

List all available valuation models.

**Parameters:** None

**Endpoint:** `GET /api/v1/valuation/models`

---

### `get_valuation_model`

Get a specific valuation model by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Valuation model ID |

**Endpoint:** `GET /api/v1/valuation/models/{id}`

---

### `create_valuation_model`

Create a new valuation model template.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Model name |
| `type` | string | Yes | Model type (e.g. dcf, comps, nav) |
| `description` | string | No | Model description |
| `schema` | object | No | Input schema for the model (key-value pairs) |

**Endpoint:** `POST /api/v1/valuation/models`
**Body:** All fields

---

### `update_valuation_model`

Update an existing valuation model.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Model ID to update |
| `name` | string | No | Updated name |
| `description` | string | No | Updated description |
| `schema` | object | No | Updated input schema |

**Endpoint:** `PATCH /api/v1/valuation/models/{id}`
**Body:** All fields except `id`

---

### `execute_valuation`

Execute a valuation model against an instrument with input data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `modelId` | string | Yes | Valuation model ID to execute |
| `instrumentId` | string | Yes | Target instrument ID |
| `inputData` | object | Yes | Input data for the valuation model (key-value pairs) |
| `author` | string | Yes | Person running the valuation |

**Endpoint:** `POST /api/v1/valuation/execute`
**Body:** `{ modelId, instrumentId, inputData, author }`

---

### `get_valuation_output`

Get a specific valuation output by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Valuation output ID |

**Endpoint:** `GET /api/v1/valuation/outputs/{id}`

---

### `list_valuations_by_instrument`

List all valuation outputs for a specific instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrument_id` | string | Yes | Instrument ID to get valuations for |

**Endpoint:** `GET /api/v1/valuation/outputs`
**Query params:** `instrument_id`

---

### `link_valuation_to_report`

Link a valuation output to a research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report_id` | string | Yes | Research report ID |
| `valuation_output_id` | string | Yes | Valuation output ID to link |

**Endpoint:** `POST /api/v1/research/{report_id}/link-valuation`
**Body:** `{ valuation_output_id }`

---

## Investment Committee

### `create_ic_meeting`

Create a new investment committee meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_date` | string | Yes | Meeting date in ISO format (YYYY-MM-DD or full ISO) |

**Endpoint:** `POST /api/v1/ic/meetings`
**Body:** `{ meetingDate }` (note: `meeting_date` is mapped to `meetingDate` in the request body)

---

### `update_meeting_status`

Update the status of an IC meeting (e.g. scheduled, in_progress, completed).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Meeting ID |
| `status` | string | Yes | New status (scheduled, in_progress, completed, cancelled) |

**Endpoint:** `PATCH /api/v1/ic/meetings/{id}`
**Body:** `{ status }`

---

### `list_ic_meetings`

List investment committee meetings with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by meeting status |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

**Endpoint:** `GET /api/v1/ic/meetings`
**Query params:** `status, limit, offset`

---

### `get_ic_meeting`

Get detailed information about a specific IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Meeting ID |

**Endpoint:** `GET /api/v1/ic/meetings/{id}`

---

### `add_agenda_item`

Add an agenda item to an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `title` | string | Yes | Agenda item title |
| `type` | string | No | Item type (e.g. new_position, review, risk) |
| `instrument_id` | string | No | Associated instrument ID |
| `research_id` | string | No | Associated research report ID |
| `presenter` | string | No | Who will present this item |
| `notes` | string | No | Additional notes |

**Endpoint:** `POST /api/v1/ic/meetings/{meeting_id}/agenda`
**Body:** All fields except `meeting_id`

---

### `update_agenda_item`

Update an agenda item on an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `id` | string | Yes | Agenda item ID |
| `title` | string | No | Updated title |
| `type` | string | No | Updated type |
| `presenter` | string | No | Updated presenter |
| `notes` | string | No | Updated notes |
| `decision` | string | No | Decision recorded for this item |

**Endpoint:** `PATCH /api/v1/ic/meetings/{meeting_id}/agenda`
**Body:** All fields except `meeting_id` (including `id` in body)

---

### `remove_agenda_item`

Remove an agenda item from an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `id` | string | Yes | Agenda item ID to remove |

**Endpoint:** `DELETE /api/v1/ic/meetings/{meeting_id}/agenda/{id}`

---

### `reorder_agenda_items`

Reorder agenda items on an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `ordered_ids` | array of strings | Yes | Agenda item IDs in desired order |

**Endpoint:** `PUT /api/v1/ic/meetings/{meeting_id}/agenda/reorder`
**Body:** `{ ordered_ids }`

---

### `post_preread`

Upload a pre-read document for an agenda item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agenda_item_id` | string | Yes | Agenda item ID |
| `title` | string | Yes | Pre-read title |
| `content` | string | Yes | Pre-read content in markdown |
| `author` | string | Yes | Author of the pre-read |

**Endpoint:** `POST /api/v1/ic/agenda/{agenda_item_id}/prereads`
**Body:** `{ title, content, author }`

---

### `post_minutes`

Post minutes for an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `body` | string | Yes | Minutes content in markdown |
| `author` | string | Yes | Author of the minutes |

**Endpoint:** `POST /api/v1/ic/meetings/{meeting_id}/minutes`
**Body:** `{ body, author }`

---

### `update_minutes`

Update existing minutes for an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID |
| `id` | string | Yes | Minutes record ID |
| `body` | string | Yes | Updated minutes content |

**Endpoint:** `PATCH /api/v1/ic/meetings/{meeting_id}/minutes`
**Body:** `{ id, body }`

---

### `record_decision`

Record a decision from an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting ID where decision was made |
| `text` | string | Yes | Decision text |
| `assignee` | string | No | Person assigned to execute the decision |
| `due_date` | string | No | Due date for the decision action (ISO format) |

**Endpoint:** `POST /api/v1/ic/decisions`
**Body:** `{ meeting_id, text, assignee, due_date }`

---

### `update_decision_status`

Update the status of an IC decision.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Decision ID |
| `status` | string | Yes | New status (pending, in_progress, completed, cancelled) |
| `note` | string | No | Optional note about the status change |

**Endpoint:** `PATCH /api/v1/ic/decisions/{id}`
**Body:** `{ status, note }`

---

### `list_decisions`

List IC decisions with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by decision status |
| `meeting_id` | string | No | Filter by meeting ID |
| `assignee` | string | No | Filter by assignee |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

**Endpoint:** `GET /api/v1/ic/decisions`
**Query params:** `status, meeting_id, assignee, limit, offset`

---

## Portfolio

### `register_trade`

Register a new trade in the portfolio.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrument_id` | string | Yes | Instrument ID |
| `side` | enum: `"buy"`, `"sell"` | Yes | Trade side |
| `quantity` | number | Yes | Number of units |
| `price` | number | Yes | Execution price per unit |
| `currency` | string | No | Trade currency |
| `trade_date` | string | No | Trade date (ISO format, defaults to today) |
| `settlement_date` | string | No | Settlement date (ISO format) |
| `broker` | string | No | Broker name |
| `notes` | string | No | Trade notes |

**Endpoint:** `POST /api/v1/portfolio/trades`
**Body:** All fields

---

### `get_positions`

Get all current portfolio positions.

**Parameters:** None

**Endpoint:** `GET /api/v1/portfolio/positions`

---

### `get_position`

Get position details for a specific instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrument_id` | string | Yes | Instrument ID |

**Endpoint:** `GET /api/v1/portfolio/positions/{instrument_id}`

---

### `get_trade_history`

Get trade history, optionally filtered by instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrument_id` | string | No | Filter by instrument ID |

**Endpoint:** `GET /api/v1/portfolio/trades`
**Query params:** `instrument_id`

---

### `get_portfolio_summary`

Get a high-level portfolio summary including NAV, returns, and key metrics.

**Parameters:** None

**Endpoint:** `GET /api/v1/portfolio/summary`

---

### `get_allocation`

Get portfolio allocation breakdown.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group_by` | string | No | Group by field (e.g. asset_class, sector, country) |

**Endpoint:** `GET /api/v1/portfolio/allocation`
**Query params:** `group_by`

---

### `get_fx_exposure`

Get portfolio foreign exchange exposure breakdown.

**Parameters:** None

**Endpoint:** `GET /api/v1/portfolio/fx-exposure`

---

### `recalculate_positions`

Trigger recalculation of all portfolio positions from trade history.

**Parameters:** None

**Endpoint:** `POST /api/v1/daily-update`

Note: This triggers the full daily update process, which includes position recalculation.

---

### `snapshot_portfolio`

Trigger a portfolio snapshot as part of the daily update process.

**Parameters:** None

**Endpoint:** `POST /api/v1/daily-update`

Note: This triggers the same daily update endpoint as `recalculate_positions`.

---

## Risk

### `publish_risk_report`

Publish a new risk report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Report type (e.g. daily, weekly, adhoc) |
| `title` | string | Yes | Report title |
| `body` | string | Yes | Report content in markdown |
| `metrics` | object | No | Key risk metrics as key-value pairs |
| `author` | string | Yes | Report author |

**Endpoint:** `POST /api/v1/risk/reports`
**Body:** All fields

---

### `get_risk_dashboard`

Get the current risk dashboard with key metrics and alerts.

**Parameters:** None

**Endpoint:** `GET /api/v1/risk/dashboard`

---

### `list_risk_reports`

List risk reports with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by report type |
| `date_from` | string | No | Start date filter (ISO format) |
| `date_to` | string | No | End date filter (ISO format) |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

**Endpoint:** `GET /api/v1/risk/reports`
**Query params:** `type, date_from, date_to, limit, offset`

---

### `get_alert_config`

Get the current risk alert configuration.

**Parameters:** None

**Endpoint:** `GET /api/v1/risk/alerts/config`

---

### `suggest_alert_change`

Suggest a change to risk alert thresholds.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metric` | string | Yes | The risk metric to alert on |
| `condition` | string | Yes | Alert condition (e.g. gt, lt, crosses) |
| `threshold` | number | Yes | Threshold value |
| `severity` | string | Yes | Alert severity (info, warning, critical) |

**Endpoint:** `POST /api/v1/risk/alerts/config`
**Body:** `{ metric, condition, threshold, severity }`

---

### `record_alert_event`

Record a risk alert event when a threshold is breached.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `trigger_id` | string | Yes | Alert trigger ID |
| `metric_value` | number | Yes | The metric value that triggered the alert |

**Endpoint:** `POST /api/v1/risk/alerts/events`
**Body:** `{ trigger_id, metric_value }`

---

### `get_risk_decomposition`

Get portfolio risk decomposition (factor exposures, contribution to risk).

**Parameters:** None

**Endpoint:** `GET /api/v1/risk/decomposition`

---

### `get_holdings_for_optimizer`

Get current holdings in a format suitable for portfolio optimization.

**Parameters:** None

**Endpoint:** `GET /api/v1/risk/holdings-for-optimizer`

---

## Notifications

### `get_notifications`

Get notifications with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `unread_only` | boolean | No | Only return unread notifications |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

**Endpoint:** `GET /api/v1/notifications`
**Query params:** `unread_only, limit, offset`

---

### `get_unread_notification_count`

Get the count of unread notifications.

**Parameters:** None

**Endpoint:** `GET /api/v1/notifications/unread-count`

---

## Platform

### `global_search`

Search across all PRRM entities (instruments, research, meetings, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `type` | string | No | Restrict to entity type (instrument, research, meeting, decision) |

**Endpoint:** `GET /api/v1/search`
**Query params:** `q, type`

---

### `get_tool_catalog`

Get the full catalog of available PRRM MCP tools organized by module.

**Parameters:** None

**Endpoint:** None (returns a hardcoded catalog; no API call is made)

---

### `trigger_daily_update`

Trigger the PRRM daily update process (recalculates positions, snapshots portfolio).

**Parameters:** None

**Endpoint:** `POST /api/v1/daily-update`

---

## Error Handling

The API client translates HTTP errors into text content returned to the agent. Exceptions are never thrown from tool handlers.

| HTTP Status | Behavior |
|-------------|----------|
| 200, 201 | Returns the `data` field from the standard `{ data: ... }` response envelope |
| 400, 422 | Returns the validation error message as text (allows the agent to see what went wrong and retry) |
| 401 | Returns `"Authentication failed -- check PRRM_API_TOKEN"` |
| 404 | Returns `"Not found"` or the error message from the response |
| 500, 503 | Returns the error message from the server |

When `PRRM_MCP_DEBUG=true` is set, all HTTP requests and their response status codes are logged to stderr with timestamps, which is useful for diagnosing connectivity or authentication issues.

---

## MCP Resources

The server exposes one MCP resource in addition to the tools.

### `prrm://guide`

An embedded integration guide that describes the PRRM platform and common workflows. The guide is available at the URI `prrm://guide` and returns Markdown content.

The guide covers:

- **Overview** of the PRRM platform and its capabilities
- **Getting started** steps for new agents
- **Common workflows:**
  - Researching an instrument (search, details, reports, valuations, comments)
  - Preparing for an IC meeting (list meetings, view agenda, add items, attach prereads, record decisions)
  - Monitoring risk (dashboard, decomposition, portfolio summary, allocation, FX exposure)
  - Running a screen (available KPIs, create profile, execute, review results)
