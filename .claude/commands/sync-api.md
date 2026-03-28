# Sync MCP Tools with PRRM API

You are synchronizing the prrm-mcp-client tool definitions with the latest PRRM REST API.

## Step 1: Fetch the latest OpenAPI spec

Fetch the OpenAPI JSON from `https://prrm.finlys.ai/api/docs/openapi.json` and save it to `docs/openapi.json` (overwrite if it exists). If the fetch fails, stop and tell the user.

## Step 2: Diff against current implementation

For every path+operation in the OpenAPI spec:

1. Determine what the corresponding MCP tool name should be (using the existing naming convention in the codebase — snake_case verb_noun pattern, e.g. `GET /instruments` → `search_instruments`, `POST /instruments` → `create_instrument`).
2. Check if that tool already exists in `packages/mcp-client/src/tools/`.
3. For existing tools, compare the parameter schemas (required/optional fields, types) against the OpenAPI request parameters and request body schema. Flag any mismatches.
4. Identify any OpenAPI operations that have NO corresponding MCP tool (new endpoints).
5. Identify any MCP tools that have NO corresponding OpenAPI operation (potentially removed endpoints).

## Step 3: Categorize changes

Organize findings into these categories and present them as a numbered plan:

- **New tools needed** — API endpoints with no MCP tool yet. List the endpoint, suggested tool name, module file, and parameters.
- **Parameter updates** — Existing tools where the OpenAPI schema has added, removed, or changed parameters. Show the diff.
- **Removed endpoints** — MCP tools that map to endpoints no longer in the OpenAPI spec. Recommend deprecation or removal.
- **No changes** — Tools that are already in sync (summarize count, don't list individually).

## Step 4: Wait for approval

Present the plan to the user in a clear markdown table format. Ask explicitly:

> "Here's what needs to change. Should I implement all of these, or would you like to select specific items?"

**Do NOT implement anything until the user approves.** If the user selects specific items, only implement those.

## Step 5: Implement (only after approval)

For approved changes:

1. Add/update tool registrations in the appropriate `packages/mcp-client/src/tools/*.ts` module file.
2. Follow the exact same pattern as existing tools (Zod schema, api client call, JSON.stringify result).
3. Update the `TOOL_CATALOG` array in `platform.ts` if tools were added or removed.
4. Run `npx tsc` to verify the build compiles.
5. Run `npm test` to verify existing tests still pass.
6. Write new tests for any new tools in `src/__tests__/integration.test.ts`.
7. Update `docs/TOOL_REFERENCE.md` with new/changed tool documentation.
8. Update the tool count in `README.md` if tools were added or removed.
9. Present a summary of all changes made.

## Step 6: Write change documentation

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

| Tool Name | Was In Module | Replacement |
|-----------|---------------|-------------|
| `tool_name` | module.ts | Use `other_tool` instead / No replacement |

> **Action required:** Remove these tools from your agent's available tool list.

## No changes

X tools unchanged.

## Full tool count

Total: N tools across M modules.
```

Omit any section that has no entries (e.g. if nothing was removed, skip "Removed tools" entirely). Keep the action-required callouts so the downstream team knows exactly what to do.

Do NOT commit — let the user decide when to commit.
