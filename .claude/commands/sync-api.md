# Sync MCP Tools with PRRM API

You are performing a full sync of the prrm-mcp-client tool definitions against the live PRRM REST API. This is not just additive — you must also detect stale tools, ghost endpoints, schema drift, and missing documentation.

## Step 1: Fetch the latest OpenAPI spec

Fetch the OpenAPI JSON from `https://prrm.finlys.ai/api/docs/openapi.json` and save it to `docs/openapi.json` (overwrite if it exists). If the fetch fails, stop and tell the user.

## Step 2: Build a complete mapping

For every path+operation in the OpenAPI spec AND every tool in `packages/mcp-client/src/tools/*.ts`:

### 2a: Map API → MCP tools

For each OpenAPI path+method:

1. Determine the corresponding MCP tool name using the existing naming convention (snake_case verb_noun, e.g. `GET /instruments` → `search_instruments`).
2. Check if that tool exists in the codebase.
3. If it exists, do a **deep schema comparison** (see 2b).
4. If it doesn't exist, flag it as a new tool needed.

### 2b: Deep schema comparison (for existing tools)

For each existing tool that maps to an API endpoint, compare:

- **Route**: Does the tool hit the correct HTTP method + path? Watch for path parameter mismatches (e.g. `/ic/prereads` vs `/ic/agenda/{id}/prereads`).
- **Request body fields**: Compare every field name in the Zod schema against the OpenAPI request body schema. Flag:
  - Fields in the MCP tool that don't exist in the API (will be silently ignored or cause errors)
  - Fields in the API that are missing from the MCP tool (agents can't set them)
  - Type mismatches (string vs number, z.record vs z.any, etc.)
  - Required/optional mismatches
  - Enum value mismatches (e.g. tool says "gt" but API expects "greater_than")
- **Query parameters** (for GET requests): Same comparison.
- **Path parameters**: Verify path params are extracted correctly and not leaked into the request body.
- **Description accuracy**: Flag tools whose descriptions are misleading about what the tool does or what fields are immutable.

### 2c: Detect ghost tools

For each MCP tool, verify its API endpoint exists in the OpenAPI spec. Tools that map to non-existent endpoints are "ghost tools" — they will return 404 or HTML error pages. These must be flagged for removal.

### 2d: Detect passthrough vs strict schema issues

For API endpoints where the request body contains flexible/nested objects (e.g. `template`, `inputData`, `criteria`, `pipeline`), check whether the MCP tool uses:
- `z.record(z.any())` — strips nested structure, may break complex payloads
- `z.object({...})` with `additionalProperties: false` (Zod default) — rejects unknown fields
- `z.any()` — true passthrough, safest for model-specific data

Flag cases where the MCP schema is stricter than the API schema and could reject valid payloads.

## Step 3: Categorize findings

Organize ALL findings into these categories and present them as a numbered plan:

### Critical (blocking agent workflows)
- **Ghost tools** — MCP tools hitting non-existent API endpoints. These always fail.
- **Wrong routes** — Tools hitting the wrong path or method.
- **Schema mismatches causing rejections** — Field names, types, or required/optional don't match, causing "Invalid request data" errors.

### Important (degraded functionality)
- **Missing fields** — API accepts fields the MCP tool doesn't expose. Agents can't use these capabilities.
- **Overly strict schemas** — MCP tool rejects valid API payloads (e.g. additionalProperties: false on flexible objects).
- **Stale descriptions** — Tool descriptions that mislead agents about behavior, immutability, or valid values.
- **Enum drift** — Tool accepts different enum values than the API.

### New coverage
- **New tools needed** — API endpoints with no MCP tool. List the endpoint, suggested tool name, module file, and parameters.

### Clean
- **No changes needed** — Tools already in sync (summarize count).

## Step 4: Ask clarifying questions

Before proposing any implementation, review the findings and ask the user questions about anything where you're uncertain about intent. This step is critical for getting the tool schemas, descriptions, and agent-facing documentation right.

Ask about:

- **New endpoints**: "The API has a new `POST /foo/bar` endpoint. What is this for? How should agents use it? What's a typical workflow where they'd call it?"
- **Ambiguous schemas**: "The API accepts a `config` object with no defined schema. What fields go in here? Can you give me an example payload?"
- **Workflow changes**: "The API removed `/ic/prereads` but agents were using it for IC meeting prep. Is there a replacement workflow, or should agents attach pre-read content differently now?"
- **Immutability/constraints**: "Can `instrumentId` be changed after creation on research reports, or is it set-once? Should the tool description warn agents about this?"
- **Enum values**: "The API accepts `status` values `draft`, `review`, `published`, `archived` — are there any other valid values agents might encounter? What does each status mean in practice?"

Group your questions logically (by module or workflow) so the user can answer efficiently. Don't ask about things you can determine from the OpenAPI spec alone.

**Wait for answers before proceeding to Step 5.**

## Step 5: Present the plan and wait for approval

Present the full plan in clear markdown tables, incorporating the answers from Step 4. For each change, show:

- What the tool currently does (route, schema)
- What it should do (based on OpenAPI + user answers)
- The specific fields/code that will change

Ask explicitly:

> "Here's the full sync plan. Should I implement all of these, or would you like to select specific items?"

**Do NOT implement anything until the user approves.**

## Step 6: Implement (only after approval)

For approved changes:

1. Fix/add/remove tool registrations in the appropriate `packages/mcp-client/src/tools/*.ts` module file.
2. Follow the exact same pattern as existing tools (Zod schema → api client call → JSON.stringify result).
3. For flexible/nested API objects, use `z.any()` passthrough unless the user explicitly wants strict validation.
4. Update the `TOOL_CATALOG` array in `platform.ts` if tools were added or removed.
5. Update the `GUIDE_CONTENT` in `index.ts` if workflows changed.
6. Run `npm run build` to verify the build compiles.
7. Run `npm test` to verify existing tests still pass.
8. Add new integration tests for any new or significantly changed tools.
9. Update `docs/TOOL_REFERENCE.md` with new/changed tool documentation.
10. Update the tool count in `README.md` if tools were added or removed.

## Step 7: Verify against live API

For every tool that was added or modified, make a test call through the MCP tool handler (using the test helper pattern from integration.test.ts) and verify:

- The API returns a JSON response (not HTML, not 404)
- The response shape is reasonable (has expected fields, not an error)
- Required fields are actually required (omitting them returns a clear validation error, not a 500)

Report any tools that fail live verification — these may indicate API-side issues vs MCP-side issues.

## Step 8: Write change documentation

After implementation, generate `docs/CHANGELOG_LATEST.md` (overwrite each sync). This file is designed to be handed off to the team building the agent orchestration system so they know exactly what changed and what to do about it.

Use this exact format:

```markdown
# PRRM MCP — Change Report

**Date:** YYYY-MM-DD
**MCP Package Version:** (read from package.json)
**Repo:** https://github.com/carlwestman/Vibe-PRRM-MCP

## How to update

1. Pull the latest version:
   ```bash
   npm install github:carlwestman/Vibe-PRRM-MCP
   # or: cd Vibe-PRRM-MCP && git pull && cd packages/mcp-client && npm install && npm run build
   ```
2. Review the tool changes below and update your agent tool configurations accordingly.

## Critical fixes

| Tool Name | Issue | Fix |
|-----------|-------|-----|
| `tool_name` | Was hitting non-existent endpoint (404) | Removed — endpoint does not exist in API |
| `tool_name` | Field `x` rejected by API | Renamed to `y` to match API schema |

> **Action required:** These fixes resolve tools that were completely broken. Update immediately.

## New tools added

| Tool Name | Module | Description | Parameters |
|-----------|--------|-------------|------------|
| `tool_name` | module.ts | What it does | `param1` (string, required), `param2` (number, optional) |

> **Action required:** Register these tools in your agent's available tool list.

## Updated tools (parameter changes)

| Tool Name | Change Type | Details |
|-----------|-------------|---------|
| `tool_name` | added param | `new_param` (string, optional) — description |
| `tool_name` | removed param | `old_param` was removed |
| `tool_name` | type change | `param` changed from string to number |

> **Action required:** Update tool schemas/configs in your agent orchestration to match the new signatures.

## Removed tools

| Tool Name | Was In Module | Reason |
|-----------|---------------|--------|
| `tool_name` | module.ts | API endpoint no longer exists / Use `other_tool` instead |

> **Action required:** Remove these tools from your agent's available tool list.

## No changes

X tools unchanged and verified working.

## Full tool count

Total: N tools across M modules.
```

Omit any section that has no entries. Keep the action-required callouts so the downstream team knows exactly what to do.

Do NOT commit — let the user decide when to commit.
