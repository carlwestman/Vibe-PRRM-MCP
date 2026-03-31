# PRRM MCP Tool Reference

Complete reference for all 149 tools exposed by the `@wsvc/prrm-mcp` server, organized by module. Every tool maps to a PRRM REST API endpoint under `/api/v1/`.

All parameters are validated with Zod schemas before the API call is made. Tool results are returned as JSON text content. Errors are never thrown -- they are returned as text so the agent can read and react to them.

---

## Table of Contents

- [Strategy](#strategy) (4 tools)
- [Instruments](#instruments) (8 tools)
- [Comments](#comments) (2 tools)
- [Screening](#screening) (34 tools)
- [Research](#research) (5 tools)
- [Valuation](#valuation) (19 tools)
- [Investment Committee](#investment-committee) (14 tools)
- [Portfolio](#portfolio) (27 tools)
- [Performance](#performance) (9 tools)
- [Risk](#risk) (14 tools)
- [Notifications](#notifications) (4 tools)
- [Platform](#platform) (9 tools)
- [Error Handling](#error-handling)
- [MCP Resources](#mcp-resources)

---

## Strategy

### `get_strategy`

Get the current investment strategy document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /strategy`

---

### `get_strategy_versions`

Get all versions of the investment strategy document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /strategy/versions`

---

### `get_strategy_version`

Get a specific strategy version by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Strategy version ID |

**Endpoint:** `GET /strategy/versions/{id}`

---

### `update_strategy`

Update the investment strategy document with new content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | required | The full updated strategy content in markdown |
| `author` | string | optional | Author of the change |

**Endpoint:** `PUT /strategy`

---

## Instruments

### `search_instruments`

Search for instruments by name, asset class, status, or sector.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | optional | Search query string |
| `assetClass` | string | optional | Filter by asset class (e.g. Equity, Fixed Income) |
| `status` | string | optional | Filter by status (e.g. Active, Inactive, Delisted) |
| `sector` | string | optional | Filter by sector |
| `limit` | number | optional | Max results to return |
| `offset` | number | optional | Offset for pagination |

**Endpoint:** `GET /instruments`

---

### `get_instrument`

Get detailed information about a specific instrument by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | The instrument ID |

**Endpoint:** `GET /instruments/{id}`

---

### `create_instrument`

Create a new instrument in the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `displayName` | string | required | Instrument display name |
| `ticker` | string | optional | Ticker symbol |
| `assetClass` | string | required | Asset class (e.g. Equity, Fixed Income, Commodity) |
| `currency` | string | required | Currency code (e.g. USD, EUR, SEK) |
| `sector` | string | optional | Sector classification |
| `country` | string | optional | Country of domicile |
| `exchange` | string | optional | Primary exchange |
| `status` | enum: `Active`, `Inactive`, `Delisted` | optional | Instrument status (default: Active) |
| `tags` | string[] | optional | Tags for categorization |
| `externalIds` | array of `{source: string, externalId: string}` | optional | External system identifiers |

**Endpoint:** `POST /instruments`

---

### `update_instrument`

Update fields on an existing instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | The instrument ID to update |
| `displayName` | string | optional | Updated display name |
| `ticker` | string | optional | Updated ticker |
| `assetClass` | string | optional | Updated asset class |
| `currency` | string | optional | Updated currency |
| `sector` | string | optional | Updated sector |
| `country` | string | optional | Updated country |
| `exchange` | string | optional | Updated exchange |
| `status` | enum: `Active`, `Inactive`, `Delisted` | optional | Updated status |
| `tags` | string[] | optional | Updated tags |

**Endpoint:** `PATCH /instruments/{id}`

---

### `add_external_id`

Add an external identifier to an instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Instrument ID |
| `source` | string | required | External data source (e.g. bloomberg, refinitiv, borsdata) |
| `externalId` | string | required | ID in the external system |

**Endpoint:** `POST /instruments/{id}/external-ids`

---

### `remove_external_id`

Remove an external identifier from an instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Instrument ID |
| `extId` | string | required | External ID record to remove |

**Endpoint:** `DELETE /instruments/{id}/external-ids/{extId}`

---

### `search_borsdata_instruments`

Search Borsdata for instruments to import.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | required | Search query (minimum 2 characters) |

**Endpoint:** `GET /instruments/import`

---

### `search_yahoo_instruments`

Search Yahoo Finance for instruments to import.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | required | Search query |

**Endpoint:** `GET /instruments/import-yahoo`

---

## Comments

### `get_comments`

Get comments for an instrument or research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | enum: `instrument`, `research` | required | Type of parent entity |
| `entity_id` | string | required | ID of the parent entity |

**Endpoint:** `GET /instruments/{entity_id}/comments` or `GET /research/{entity_id}/comments` (based on `entity_type`)

---

### `add_comment`

Add a comment to an instrument or research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | enum: `instrument`, `research` | required | Type of parent entity |
| `entity_id` | string | required | ID of the parent entity |
| `body` | string | required | Comment text |
| `author` | string | optional | Name of the commenter |

**Endpoint:** `POST /instruments/{entity_id}/comments` or `POST /research/{entity_id}/comments` (based on `entity_type`)

---

## Screening

### `list_screening_profiles`

List all screening profiles.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /screening/profiles`

---

### `get_screening_profile`

Get a specific screening profile by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Screening profile ID |

**Endpoint:** `GET /screening/profiles/{id}`

---

### `create_screening_profile`

Create a new screening profile with criteria and thresholds.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | required | Profile name |
| `scope` | string | required | Screening scope (e.g. nordic, global) |
| `description` | string | optional | Profile description |
| `criteria` | array of `{field: string, operator: string, value: any}` | required | Screening criteria. Operator is one of: gt, lt, gte, lte, eq |
| `includeFilters` | Record<string, any> | optional | Include filters |
| `excludeFilters` | Record<string, any> | optional | Exclude filters |

**Endpoint:** `POST /screening/profiles`

---

### `update_screening_profile`

Update an existing screening profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Profile ID to update |
| `name` | string | optional | Updated name |
| `scope` | string | optional | Updated scope |
| `description` | string | optional | Updated description |
| `criteria` | array of `{field: string, operator: string, value: any}` | optional | Updated criteria |
| `includeFilters` | Record<string, any> | optional | Updated include filters |
| `excludeFilters` | Record<string, any> | optional | Updated exclude filters |

**Endpoint:** `PATCH /screening/profiles/{id}`

---

### `delete_screening_profile`

Delete a screening profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Screening profile ID to delete |

**Endpoint:** `DELETE /screening/profiles/{id}`

---

### `run_screen`

Execute a screening profile to find matching instruments.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | required | Screening profile ID to run |

**Endpoint:** `POST /screening/profiles/{profileId}/run`

---

### `get_screen_results`

Get results from a completed screening run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `runId` | string | required | Screening run ID |

**Endpoint:** `GET /screening/runs/{runId}/results`

---

### `create_instruments_from_screening`

Create instruments from screening run results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Screening run ID |
| `resultIds` | number[] | required | IDs of screening results to create instruments from |

**Endpoint:** `POST /screening/runs/{id}/create-instruments`

---

### `get_available_kpis`

Get available KPIs for screening criteria.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | optional | Filter by KPI category |
| `q` | string | optional | Search query for KPI names |

**Endpoint:** `GET /screening/kpis`

---

### `get_screening_classifications`

Get available screening classifications (countries, markets, sectors, branches).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /screening/classifications`

---

### `get_universe`

Get the instrument universe with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `flagged_only` | boolean | optional | Filter to flagged instruments only |
| `limit` | number | optional | Max results (default 50) |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /universe`

---

### `update_universe_entry`

Flag or dismiss an instrument in the universe.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Universe entry ID |
| `action` | enum: `flag`, `dismiss` | required | Action to take on the entry |

**Endpoint:** `PATCH /universe/{id}`

---

### `list_intersection_configs`

List screening intersection configurations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | optional | Filter by status |

**Endpoint:** `GET /screening/intersections`

---

### `create_intersection_config`

Create a screening intersection configuration that combines multiple screening profiles.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | required | Intersection config name |
| `description` | string | optional | Description |
| `pipeline` | array | required | Pipeline steps defining which profiles to intersect |
| `scoring` | Record<string, any> | optional | Scoring configuration |

**Endpoint:** `POST /screening/intersections`

---

### `get_intersection_config`

Get a specific screening intersection configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection config ID |

**Endpoint:** `GET /screening/intersections/{id}`

---

### `update_intersection_config`

Update a screening intersection configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection config ID |
| `name` | string | optional | Updated name |
| `description` | string | optional | Updated description |
| `pipeline` | array | optional | Updated pipeline steps |
| `scoring` | Record<string, any> | optional | Updated scoring configuration |

**Endpoint:** `PATCH /screening/intersections/{id}`

---

### `delete_intersection_config`

Archive a screening intersection configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection config ID to archive |

**Endpoint:** `DELETE /screening/intersections/{id}`

---

### `run_intersection`

Run a screening intersection pipeline.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection config ID to run |
| `forceRefresh` | boolean | optional | Force refresh underlying screens |
| `dryRun` | boolean | optional | Dry run without persisting results |
| `syncToUniverse` | boolean | optional | Sync results to the investment universe |
| `triggeredBy` | string | optional | Who triggered the run |
| `triggerType` | string | optional | How it was triggered (manual, scheduled, etc.) |

**Endpoint:** `POST /screening/intersections/{id}/run`

---

### `list_intersection_runs`

List runs for a screening intersection configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection config ID |

**Endpoint:** `GET /screening/intersections/{id}/runs`

---

### `get_intersection_run`

Get a specific intersection run with results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Intersection run ID |

**Endpoint:** `GET /screening/intersection-runs/{id}`

---

### `get_intersection_diff`

Compare two intersection runs to see what changed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Base intersection run ID |
| `otherId` | string | required | Other intersection run ID to compare against |

**Endpoint:** `GET /screening/intersection-runs/{id}/diff/{otherId}`

---

### `get_current_universe`

Get the current active investment universe.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /universe/current`

---

### `list_universe_versions`

List historical universe versions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /universe/versions`

---

### `get_universe_version`

Get a specific universe version by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Universe version ID |

**Endpoint:** `GET /universe/versions/{id}`

---

### `get_universe_diff`

Diff two universe versions to see what changed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | number | required | Source universe version ID |
| `to` | number | required | Target universe version ID |

**Endpoint:** `GET /universe/diff`

---

### `get_universe_staleness`

Check how stale the current universe is relative to latest screening runs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /universe/staleness`

---

### `get_position_alerts`

Get position-level alerts for the universe (e.g. missing data, stale prices).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /universe/alerts`

---

### `get_universe_overrides`

Get active manual overrides on the universe.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /universe/overrides`

---

### `propose_universe`

Create a universe proposal from an intersection run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intersectionRunId` | number | required | Intersection run ID to base the proposal on |
| `selectedResultIds` | number[] | optional | Specific result IDs to include |
| `overrides` | array | optional | Manual override entries |
| `proposedBy` | string | optional | Who is proposing the change |

**Endpoint:** `POST /universe/propose`

---

### `get_proposal`

Get a universe proposal by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Proposal ID |

**Endpoint:** `GET /universe/proposals/{id}`

---

### `update_proposal_instrument`

Toggle whether an instrument is included in a universe proposal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Proposal ID |
| `instId` | string | required | Instrument ID |
| `included` | boolean | required | Whether to include the instrument |

**Endpoint:** `PATCH /universe/proposals/{id}/instruments/{instId}`

---

### `add_override_to_proposal`

Add a manual override instrument to a universe proposal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Proposal ID |
| `borsdataInsId` | number | required | Borsdata instrument ID to add |
| `displayName` | string | required | Display name for the instrument |
| `rationale` | string | required | Reason for the manual override |

**Endpoint:** `POST /universe/proposals/{id}/overrides`

---

### `remove_override_from_proposal`

Remove a manual override instrument from a universe proposal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Proposal ID |
| `instId` | string | required | Instrument ID to remove |

**Endpoint:** `DELETE /universe/proposals/{id}/overrides/{instId}`

---

### `commit_universe`

Commit a universe proposal, replacing the current active universe.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `proposalId` | number | required | Proposal ID to commit |

**Endpoint:** `PUT /universe/replace`

---

## Research

### `list_research_reports`

List research reports with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | optional | Report type filter |
| `status` | string | optional | Report status filter |
| `recommendation` | string | optional | Filter by recommendation (Buy, Sell, Hold) |
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /research`

---

### `get_research_report`

Get a specific research report by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Research report ID |

**Endpoint:** `GET /research/{id}`

---

### `create_research_report`

Create a new research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | required | Report title |
| `type` | string | required | Report type (e.g. Instrument Research, Thematic, Ad-Hoc) |
| `instrumentId` | number | required | Associated instrument ID |
| `author` | string | required | Report author |
| `body` | string | required | Report content in markdown |
| `recommendation` | string | optional | Investment recommendation (Buy, Sell, Hold) |
| `status` | string | optional | Report status (default: draft) |

**Endpoint:** `POST /research`

---

### `update_research_report`

Update an existing research report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Report ID to update |
| `title` | string | optional | Updated title |
| `body` | string | optional | Updated body content |
| `status` | string | optional | Updated status |
| `recommendation` | string | optional | Updated recommendation |

**Endpoint:** `PATCH /research/{id}`

---

### `search_research_semantic`

Semantic search across research reports.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | required | Natural language search query |
| `limit` | number | optional | Max results to return (1-50, default 10) |

**Endpoint:** `POST /research/search`

---

## Valuation

### `list_valuation_models`

List all available valuation models.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /valuation/models`

---

### `get_valuation_model`

Get a specific valuation model by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Valuation model ID |

**Endpoint:** `GET /valuation/models/{id}`

---

### `create_valuation_model`

Create a new valuation model template.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | required | Model name |
| `type` | enum: `dcf`, `comparables`, `ddm`, `nav`, `custom` | required | Model type |
| `template` | Record<string, any> | required | Model template definition |
| `description` | string | optional | Model description |
| `author` | string | optional | Model author |

**Endpoint:** `POST /valuation/models`

---

### `update_valuation_model`

Update an existing valuation model.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Model ID to update |
| `name` | string | optional | Updated name |
| `description` | string | optional | Updated description |
| `template` | Record<string, any> | optional | Updated template definition |

**Endpoint:** `PATCH /valuation/models/{id}`

---

### `execute_valuation`

Execute a valuation model against an instrument with input data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `modelId` | string | required | Valuation model ID to execute |
| `instrumentId` | string | required | Target instrument ID |
| `inputData` | Record<string, any> | required | Input data for the valuation model |
| `author` | string | required | Person running the valuation |

**Endpoint:** `POST /valuation/execute`

---

### `get_valuation_output`

Get a specific valuation output by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Valuation output ID |

**Endpoint:** `GET /valuation/outputs/{id}`

---

### `list_valuations_by_instrument`

List all valuation outputs for a specific instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrument_id` | string | required | Instrument ID to get valuations for |

**Endpoint:** `GET /valuation/outputs`

---

### `autofill_valuation`

Auto-fill valuation model inputs from Borsdata data for an instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `modelId` | number | required | Valuation model ID |
| `instrumentId` | number | required | Instrument ID to pull data for |

**Endpoint:** `GET /valuation/autofill`

---

### `list_scenarios`

List valuation scenarios for an instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrumentId` | number | required | Instrument ID |

**Endpoint:** `GET /valuation/scenarios`

---

### `create_scenario`

Create a new valuation scenario.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | Record<string, any> | optional | Scenario data |

**Endpoint:** `POST /valuation/scenarios`

---

### `get_scenario`

Get a specific valuation scenario by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID |

**Endpoint:** `GET /valuation/scenarios/{id}`

---

### `update_scenario`

Update an existing valuation scenario.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID |
| `data` | Record<string, any> | optional | Fields to update |

**Endpoint:** `PATCH /valuation/scenarios/{id}`

---

### `delete_scenario`

Delete a valuation scenario.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID |

**Endpoint:** `DELETE /valuation/scenarios/{id}`

---

### `copy_scenario`

Create a copy of an existing valuation scenario.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID to copy |

**Endpoint:** `POST /valuation/scenarios/{id}/copy`

---

### `execute_scenario`

Execute a valuation scenario to produce an output.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID to execute |

**Endpoint:** `POST /valuation/scenarios/{id}/execute`

---

### `get_scenario_history`

Get version history for a valuation scenario.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID |

**Endpoint:** `GET /valuation/scenarios/{id}/history`

---

### `what_if_valuation`

Run a disposable what-if analysis on a scenario without saving.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Scenario ID to base the what-if on |
| `data` | Record<string, any> | optional | Override inputs for the what-if |

**Endpoint:** `POST /valuation/scenarios/{id}/what-if`

---

### `compare_scenarios`

Compare multiple valuation scenarios side by side.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | Record<string, any> | optional | Comparison parameters (e.g. scenario IDs) |

**Endpoint:** `POST /valuation/scenarios/compare`

---

### `export_scenarios_to_ic`

Export valuation scenarios to an IC meeting agenda.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | Record<string, any> | optional | Export parameters (e.g. scenario IDs, meeting ID) |

**Endpoint:** `POST /valuation/scenarios/export-to-ic`

---

## Investment Committee

### `create_ic_meeting`

Create a new investment committee meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetingDate` | string | required | Meeting date (YYYY-MM-DD) |

**Endpoint:** `POST /ic/meetings`

---

### `update_ic_meeting`

Update an IC meeting (status and/or date).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Meeting ID |
| `status` | string | optional | New status |
| `meetingDate` | string | optional | Updated meeting date (YYYY-MM-DD) |

**Endpoint:** `PATCH /ic/meetings/{id}`

---

### `list_ic_meetings`

List investment committee meetings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | optional | Filter by meeting status |
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /ic/meetings`

---

### `get_ic_meeting`

Get detailed information about a specific IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Meeting ID |

**Endpoint:** `GET /ic/meetings/{id}`

---

### `add_agenda_item`

Add an agenda item to an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetingId` | number | required | Meeting ID |
| `title` | string | required | Agenda item title |
| `description` | string | optional | Longer description of the agenda item |
| `sortOrder` | number | optional | Display order (0-based) |
| `links` | array of `{ entityType, entityId }` | optional | Links to instruments, research reports, or valuations |

**Endpoint:** `POST /ic/meetings/{meetingId}/agenda`

---

### `update_agenda_item`

Update an existing IC agenda item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Agenda item ID |
| `title` | string | optional | New title |
| `description` | string | optional | New description |
| `sortOrder` | number | optional | New sort position |

**Endpoint:** `PATCH /ic/agenda/{id}`

---

### `remove_agenda_item`

Remove an agenda item from an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Agenda item ID |

**Endpoint:** `DELETE /ic/agenda/{id}`

---

### `reorder_agenda_items`

Set the display order for all agenda items in a meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetingId` | number | required | Meeting ID |
| `orderedIds` | number[] | required | Agenda item IDs in desired order |

**Endpoint:** `POST /ic/meetings/{meetingId}/agenda/reorder`

---

### `post_preread`

Attach a pre-read document to an IC agenda item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agendaItemId` | number | required | Agenda item ID |
| `title` | string | required | Pre-read title |
| `body` | string | required | Pre-read content in Markdown |
| `author` | string | optional | Author (default: PM) |

**Endpoint:** `POST /ic/prereads`

---

### `post_minutes`

Post minutes for an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | required | Meeting ID |
| `body` | string | required | Minutes content in Markdown |
| `author` | string | optional | Author of the minutes (default: PM) |

**Endpoint:** `POST /ic/meetings/{meeting_id}/minutes`

---

### `update_minutes`

Update existing minutes for an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Minutes record ID |
| `body` | string | required | Updated minutes content |

**Endpoint:** `PATCH /ic/meetings/{id}/minutes`

---

### `record_decision`

Record a decision from an IC meeting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meetingId` | number | required | Meeting ID where decision was made |
| `text` | string | required | Decision text (e.g. 'Buy 50 shares of ASSA ABLOY at market') |
| `assignee` | string | optional | Person responsible for executing the decision |
| `dueDate` | string | optional | Due date (YYYY-MM-DD) |

**Endpoint:** `POST /ic/decisions`

---

### `update_decision_status`

Update the status of an IC decision.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Decision ID |
| `status` | enum: `Decided`, `In Progress`, `Executed`, `Reviewed` | required | New status |
| `note` | string | optional | Explanation of the status change |

**Endpoint:** `PATCH /ic/decisions/{id}`

---

### `list_decisions`

List IC decisions with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | optional | Filter by status (Decided, In Progress, Executed, Reviewed) |
| `meetingId` | number | optional | Filter by meeting ID |
| `assignee` | string | optional | Filter by assignee |
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /ic/decisions`

---

## Portfolio

### `register_trade`

Register a new trade in the portfolio.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrumentId` | number | required | Instrument ID |
| `tradeType` | enum: `buy`, `sell` | required | Trade type |
| `shares` | number | required | Number of shares |
| `pricePerShare` | number | required | Price per share |
| `tradeDate` | string | required | Trade date (YYYY-MM-DD) |
| `currency` | string | required | Trade currency (e.g. SEK, USD) |
| `fxRate` | number | optional | FX rate to base currency |

**Endpoint:** `POST /portfolio/trades`

---

### `get_positions`

Get all current portfolio positions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/positions`

---

### `get_position`

Get position details for a specific instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrumentId` | string | required | Instrument ID |

**Endpoint:** `GET /portfolio/positions/{instrumentId}`

---

### `get_trade_history`

Get trade history, optionally filtered by instrument.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `instrumentId` | string | optional | Filter by instrument ID |

**Endpoint:** `GET /portfolio/trades`

---

### `get_portfolio_summary`

Get a high-level portfolio summary including NAV, returns, and key metrics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/summary`

---

### `get_allocation`

Get portfolio allocation breakdown.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group_by` | string | optional | Group by field (e.g. assetClass, sector, country) |

**Endpoint:** `GET /portfolio/allocation`

---

### `get_fx_exposure`

Get portfolio foreign exchange exposure breakdown.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/fx-exposure`

---

### `update_trade`

Update an existing trade.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Trade ID |
| `instrumentId` | number | optional | Updated instrument ID |
| `shares` | number | optional | Updated number of shares |
| `pricePerShare` | number | optional | Updated price per share |
| `fxRate` | number | optional | Updated FX rate |
| `notes` | string | optional | Updated notes |

**Endpoint:** `PATCH /portfolio/trades/{id}`

---

### `delete_trade`

Delete a trade from the portfolio.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Trade ID to delete |

**Endpoint:** `DELETE /portfolio/trades/{id}`

---

### `get_cash_balances`

Get cash balances across currencies.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sub_portfolio_id` | number | optional | Filter by sub-portfolio ID |

**Endpoint:** `GET /portfolio/cash`

---

### `record_deposit`

Record a cash deposit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | optional | Deposit details |

**Endpoint:** `POST /portfolio/cash/deposit`

---

### `get_cash_transactions`

List cash transactions with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sub_portfolio_id` | number | optional | Filter by sub-portfolio |
| `currency` | string | optional | Filter by currency |
| `type` | string | optional | Filter by transaction type |
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /portfolio/cash/transactions`

---

### `record_withdrawal`

Record a cash withdrawal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | optional | Withdrawal details |

**Endpoint:** `POST /portfolio/cash/withdraw`

---

### `get_portfolio_config`

Get portfolio configuration (base currency, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/config`

---

### `update_portfolio_config`

Update portfolio configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | optional | Configuration fields to update |

**Endpoint:** `PATCH /portfolio/config`

---

### `get_dividends`

List dividends with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `view` | string | optional | View type |
| `instrument_id` | number | optional | Filter by instrument |
| `year` | number | optional | Filter by year |

**Endpoint:** `GET /portfolio/dividends`

---

### `record_dividend`

Record a dividend payment.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | optional | Dividend details |

**Endpoint:** `POST /portfolio/dividends`

---

### `sync_dividends`

Sync dividends from Borsdata for all holdings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `POST /portfolio/dividends/sync`

---

### `create_import_session`

Create a new trade import session (for CSV/broker imports).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `POST /portfolio/import/sessions`

---

### `get_import_session`

Get an import session with its parsed rows.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Import session ID |

**Endpoint:** `GET /portfolio/import/sessions/{id}`

---

### `cancel_import_session`

Cancel an import session and discard its data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Import session ID |

**Endpoint:** `DELETE /portfolio/import/sessions/{id}`

---

### `commit_import_session`

Commit an import session, creating trades from its rows.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Import session ID |

**Endpoint:** `POST /portfolio/import/sessions/{id}/commit`

---

### `update_import_row`

Update a row in an import session (fix mapping, amounts, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Import session ID |
| `rowId` | string | required | Row ID within the session |
| `data` | object | optional | Fields to update on the row |

**Endpoint:** `PATCH /portfolio/import/sessions/{id}/rows/{rowId}`

---

### `get_margin_summary`

Get margin utilization summary.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/margin`

---

### `get_realised_pnl`

Get realized P&L summary from closed positions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sub_portfolio_id` | number | optional | Filter by sub-portfolio |
| `date_from` | string | optional | Start date (YYYY-MM-DD) |
| `date_to` | string | optional | End date (YYYY-MM-DD) |

**Endpoint:** `GET /portfolio/realised-pnl`

---

### `list_sub_portfolios`

List all sub-portfolios (sleeves).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /portfolio/sub-portfolios`

---

### `create_sub_portfolio`

Create a new sub-portfolio (sleeve).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | optional | Sub-portfolio details (name, description, etc.) |

**Endpoint:** `POST /portfolio/sub-portfolios`

---

## Performance

### `get_performance_summary`

Get portfolio performance summary for a given period.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | enum: `wtd`, `mtd`, `qtd`, `ytd`, `custom` | required | Time period |
| `date_from` | string | optional | Start date for custom period (YYYY-MM-DD) |
| `date_to` | string | optional | End date for custom period (YYYY-MM-DD) |
| `as_of_date` | string | optional | As-of date (YYYY-MM-DD) |

**Endpoint:** `GET /performance/summary`

---

### `get_return_series`

Get portfolio and benchmark return time series.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | required | Start date (YYYY-MM-DD) |
| `date_to` | string | required | End date (YYYY-MM-DD) |
| `interval` | enum: `daily`, `weekly`, `monthly` | required | Return interval |

**Endpoint:** `GET /performance/returns`

---

### `get_performance_attribution`

Get performance attribution analysis by position, sector, or currency.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | required | Start date (YYYY-MM-DD) |
| `date_to` | string | required | End date (YYYY-MM-DD) |
| `group_by` | enum: `position`, `sector`, `currency` | required | Attribution grouping |

**Endpoint:** `GET /performance/attribution`

---

### `get_drawdown_analysis`

Get portfolio drawdown analysis including current and maximum drawdowns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date_from` | string | optional | Start date (YYYY-MM-DD) |
| `date_to` | string | optional | End date (YYYY-MM-DD) |

**Endpoint:** `GET /performance/drawdown`

---

### `get_benchmark_config`

Get the current benchmark configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /performance/benchmark`

---

### `set_benchmark`

Set a benchmark instrument for performance comparison.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | required | Benchmark name |
| `instrumentId` | number | required | Instrument ID to use as benchmark |

**Endpoint:** `POST /performance/benchmark`

---

### `list_performance_reports`

List performance reports with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | enum: `weekly`, `monthly`, `quarterly`, `annual`, `ad_hoc` | optional | Filter by report period |
| `date_from` | string | optional | Start date filter (YYYY-MM-DD) |
| `date_to` | string | optional | End date filter (YYYY-MM-DD) |
| `limit` | number | optional | Max results (default 50) |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /performance/reports`

---

### `create_performance_report`

Create a new performance report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reportDate` | string | required | Report date (YYYY-MM-DD) |
| `period` | enum: `weekly`, `monthly`, `quarterly`, `annual`, `ad_hoc` | required | Report period |
| `periodStart` | string | required | Period start date (YYYY-MM-DD) |
| `periodEnd` | string | required | Period end date (YYYY-MM-DD) |
| `author` | string | required | Report author |
| `body` | string | required | Report content in markdown |
| `metricsSnapshot` | Record<string, any> | optional | Snapshot of key metrics |

**Endpoint:** `POST /performance/reports`

---

### `get_performance_report`

Get a specific performance report by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Performance report ID |

**Endpoint:** `GET /performance/reports/{id}`

---

## Risk

### `publish_risk_report`

Publish a new risk report.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | required | Report type (e.g. daily, weekly, adhoc) |
| `title` | string | required | Report title |
| `body` | string | required | Report content in markdown |
| `metrics` | Record<string, any> | optional | Key risk metrics as key-value pairs |
| `author` | string | required | Report author |

**Endpoint:** `POST /risk/reports`

---

### `get_risk_report`

Get a specific risk report by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Risk report ID |

**Endpoint:** `GET /risk/reports/{id}`

---

### `get_risk_dashboard`

Get the current risk dashboard with key metrics and alerts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /risk/dashboard`

---

### `list_risk_reports`

List risk reports with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | optional | Filter by report type |
| `date_from` | string | optional | Start date filter (YYYY-MM-DD) |
| `date_to` | string | optional | End date filter (YYYY-MM-DD) |

**Endpoint:** `GET /risk/reports`

---

### `get_alert_config`

Get the current risk alert trigger configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /risk/alerts/config`

---

### `create_risk_alert_trigger`

Create a new risk alert trigger.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metric` | string | required | The risk metric to alert on |
| `operator` | enum: `gt`, `gte`, `lt`, `lte`, `eq` | required | Comparison operator |
| `threshold` | number | required | Threshold value |
| `enabled` | boolean | optional | Whether the trigger is enabled (default: true) |

**Endpoint:** `POST /risk/alerts/config`

---

### `update_risk_alert_trigger`

Update an existing risk alert trigger.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Alert trigger ID |
| `metric` | string | optional | Updated metric |
| `operator` | enum: `gt`, `gte`, `lt`, `lte`, `eq` | optional | Updated operator |
| `threshold` | number | optional | Updated threshold |
| `enabled` | boolean | optional | Enable or disable the trigger |

**Endpoint:** `PATCH /risk/alerts/config/{id}`

---

### `delete_risk_alert_trigger`

Delete a risk alert trigger.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Alert trigger ID to delete |

**Endpoint:** `DELETE /risk/alerts/config/{id}`

---

### `list_risk_alert_events`

List risk alert events that have been triggered.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /risk/alerts/events`

---

### `acknowledge_risk_alert_event`

Acknowledge a risk alert event.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Alert event ID |
| `acknowledged` | boolean | required | Set to true to acknowledge |
| `acknowledgedBy` | string | optional | Person acknowledging the alert |

**Endpoint:** `PATCH /risk/alerts/events/{id}`

---

### `get_risk_analytics`

Get portfolio risk metrics from historical simulation (VaR, CVaR, volatility).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lookback_days` | number | optional | Lookback period in days |

**Endpoint:** `GET /risk/analytics`

---

### `get_risk_contributions`

Get per-position risk contributions to portfolio risk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lookback_days` | number | optional | Lookback period in days |

**Endpoint:** `GET /risk/contributions`

---

### `get_correlation_matrix`

Get position correlation matrix.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lookback_days` | number | optional | Lookback period in days |

**Endpoint:** `GET /risk/correlations`

---

### `run_stress_test`

Run a stress test scenario against the portfolio.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scenario` | string | required | Stress test scenario name or description |
| `shocks` | object | required | Shock parameters (e.g. { equity: -0.2, rates: 0.01 }) |

**Endpoint:** `POST /risk/stress-test`

---

## Notifications

### `get_notifications`

Get notifications with optional filters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `unread_only` | boolean | optional | Only return unread notifications |
| `limit` | number | optional | Max results |
| `offset` | number | optional | Pagination offset |

**Endpoint:** `GET /notifications`

---

### `get_unread_notification_count`

Get the count of unread notifications.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /notifications/unread-count`

---

### `mark_notification_read`

Mark a specific notification as read.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | required | Notification ID |

**Endpoint:** `PATCH /notifications/{id}/read`

---

### `mark_all_notifications_read`

Mark all notifications as read.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `POST /notifications/mark-all-read`

---

## Platform

### `global_search`

Search across all PRRM entities (instruments, research, meetings, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | required | Search query |
| `type` | string | optional | Restrict to entity type (instrument, research, meeting, decision) |

**Endpoint:** `GET /search`

---

### `get_tool_catalog`

Get the full catalog of available PRRM MCP tools organized by module.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** *(local -- returns the built-in tool catalog, no REST call)*

---

### `trigger_daily_update`

Trigger the PRRM daily update process (recalculates positions, snapshots portfolio).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `POST /daily-update`

---

### `health_check`

Check PRRM server health status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /health`

---

### `get_settings`

Get PRRM application settings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /settings`

---

### `update_setting`

Update a PRRM application setting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | required | Setting key |
| `value` | any | required | Setting value |

**Endpoint:** `PATCH /settings`

---

### `get_webhook_config`

Get outbound webhook configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `GET /webhooks/config`

---

### `update_webhook_config`

Update outbound webhook configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | required | Webhook URL |
| `enabled` | boolean | required | Whether the webhook is enabled |
| `events` | string[] | required | Event types to send |

**Endpoint:** `PUT /webhooks/config`

---

### `test_webhook`

Send a test webhook to the configured URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *(none)* | | | |

**Endpoint:** `POST /webhooks/test`

---

## Error Handling

All tools follow the same error handling pattern. Errors are **never thrown** to the MCP transport. Instead, they are caught by the API client and returned as JSON text content so the LLM agent can read and react to them.

### Error response shape

```json
{
  "error": true,
  "status": 404,
  "message": "Instrument not found",
  "details": {}
}
```

### Common error codes

| HTTP Status | Meaning | Typical Cause |
|-------------|---------|---------------|
| `400` | Bad Request | Invalid parameters, missing required fields |
| `401` | Unauthorized | Missing or invalid API key |
| `403` | Forbidden | Insufficient permissions for the operation |
| `404` | Not Found | Entity ID does not exist |
| `409` | Conflict | Duplicate entry or version conflict |
| `422` | Unprocessable Entity | Validation failed on the server side |
| `500` | Internal Server Error | Unexpected server failure |

### Agent guidance

When an error is returned, the agent should:

1. Read the `message` and `details` fields to understand what went wrong.
2. For `404` errors, verify the entity ID is correct (e.g. use `search_instruments` to find the right ID).
3. For `400`/`422` errors, check the parameter values against the schema above.
4. For `401`/`403` errors, inform the user that authentication or permissions need attention.
5. For `500` errors, retry once; if the error persists, report the issue to the user.

---

## MCP Resources

### `prrm://guide`

The server exposes a single MCP resource at URI `prrm://guide`. This resource returns a markdown document describing the PRRM platform, its investment workflow, and guidance for agents on how to use the tools effectively.

**Usage:** Agents should read this resource at the start of a session to understand the PRRM domain model and recommended tool usage patterns. It covers:

- Platform overview and purpose
- The investment workflow (screening, research, valuation, IC, portfolio, performance, risk)
- Domain-specific terminology
- Recommended tool call sequences for common tasks
- Best practices for interacting with the PRRM system
