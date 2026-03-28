# PRRM MCP Client

## What this is

A standalone TypeScript MCP server (`@wsvc/prrm-mcp`) that proxies tool calls to the PRRM REST API. Lives in `packages/mcp-client/`.

## Key files

- `packages/mcp-client/src/index.ts` — entry point, server setup, guide resource
- `packages/mcp-client/src/api-client.ts` — HTTP client (fetch + auth + envelope unwrap)
- `packages/mcp-client/src/tools/*.ts` — 11 tool modules, 68 tools total
- `packages/mcp-client/src/__tests__/` — integration tests against live API
- `docs/PRRM_MCP_CLIENT_SPEC.md` — original design spec
- `docs/TOOL_REFERENCE.md` — detailed tool-by-tool reference

## API reference

- Live docs: https://prrm.finlys.ai/api/docs
- OpenAPI spec: https://prrm.finlys.ai/api/docs/openapi.json

## Conventions

- Every tool: Zod params → api client call → `{ content: [{ type: "text", text: JSON.stringify(result) }] }`
- Never throw from tool handlers — return errors as text content
- API client unwraps `{ data: ... }` envelope, extracts `.error.message` from error responses
- Tool names: snake_case, verb_noun (e.g. `get_instrument`, `create_research_report`)
- One register function per module: `registerXxxTools(server, api)`

## Commands

- `npm run build` — compile TypeScript
- `npm run dev` — run with tsx (no build)
- `npm test` — run integration tests (requires PRRM_BASE_URL and PRRM_API_TOKEN)
- `/sync-api` — fetch latest OpenAPI spec, diff against tools, plan updates
