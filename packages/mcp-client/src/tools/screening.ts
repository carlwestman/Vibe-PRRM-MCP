import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerScreeningTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "list_screening_profiles",
    "List all screening profiles",
    {},
    async () => {
      const result = await api.get("/screening/profiles");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_screening_profile",
    "Get a specific screening profile by ID",
    {
      id: z.string().describe("Screening profile ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/screening/profiles/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_screening_profile",
    "Create a new screening profile with criteria and thresholds",
    {
      name: z.string().describe("Profile name"),
      scope: z.string().describe("Screening scope (e.g. nordic, global)"),
      description: z.string().optional().describe("Profile description"),
      criteria: z.array(z.object({
        field: z.string().describe("Field/KPI identifier"),
        operator: z.string().describe("Comparison operator (gt, lt, gte, lte, eq)"),
        value: z.any().describe("Threshold value"),
      })).describe("Screening criteria"),
      includeFilters: z.record(z.any()).optional().describe("Include filters"),
      excludeFilters: z.record(z.any()).optional().describe("Exclude filters"),
    },
    async (params) => {
      const result = await api.post("/screening/profiles", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_screening_profile",
    "Update an existing screening profile",
    {
      id: z.string().describe("Profile ID to update"),
      name: z.string().optional().describe("Updated name"),
      scope: z.string().optional().describe("Updated scope"),
      description: z.string().optional().describe("Updated description"),
      criteria: z.array(z.object({
        field: z.string().describe("Field/KPI identifier"),
        operator: z.string().describe("Comparison operator"),
        value: z.any().describe("Threshold value"),
      })).optional().describe("Updated criteria"),
      includeFilters: z.record(z.any()).optional().describe("Updated include filters"),
      excludeFilters: z.record(z.any()).optional().describe("Updated exclude filters"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/screening/profiles/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_screening_profile",
    "Delete a screening profile",
    {
      id: z.string().describe("Screening profile ID to delete"),
    },
    async ({ id }) => {
      const result = await api.delete(`/screening/profiles/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "run_screen",
    "Execute a screening profile to find matching instruments",
    {
      profileId: z.string().describe("Screening profile ID to run"),
    },
    async ({ profileId }) => {
      const result = await api.post(`/screening/profiles/${profileId}/run`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_screen_results",
    "Get results from a completed screening run",
    {
      runId: z.string().describe("Screening run ID"),
    },
    async ({ runId }) => {
      const result = await api.get(`/screening/runs/${runId}/results`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_instruments_from_screening",
    "Create instruments from screening run results",
    {
      id: z.string().describe("Screening run ID"),
      resultIds: z.array(z.number()).describe("IDs of screening results to create instruments from"),
    },
    async ({ id, resultIds }) => {
      const result = await api.post(`/screening/runs/${id}/create-instruments`, { resultIds });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_available_kpis",
    "Get available KPIs for screening criteria",
    {
      category: z.string().optional().describe("Filter by KPI category"),
      q: z.string().optional().describe("Search query for KPI names"),
    },
    async (params) => {
      const result = await api.get("/screening/kpis", {
        category: params.category,
        q: params.q,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_screening_classifications",
    "Get available screening classifications (countries, markets, sectors, branches)",
    {},
    async () => {
      const result = await api.get("/screening/classifications");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_universe",
    "Get the instrument universe with optional filters",
    {
      flagged_only: z.boolean().optional().describe("Filter to flagged instruments only"),
      limit: z.number().optional().describe("Max results (default 50)"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/universe", {
        flagged_only: params.flagged_only?.toString(),
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_universe_entry",
    "Flag or dismiss an instrument in the universe",
    {
      id: z.string().describe("Universe entry ID"),
      action: z.enum(["flag", "dismiss"]).describe("Action to take on the entry"),
    },
    async ({ id, action }) => {
      const result = await api.patch(`/universe/${id}`, { action });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Intersection configs ───────────────────────────────

  server.tool(
    "list_intersection_configs",
    "List screening intersection configurations",
    {
      status: z.string().optional().describe("Filter by status"),
    },
    async (params) => {
      const result = await api.get("/screening/intersections", { status: params.status });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_intersection_config",
    "Create a screening intersection configuration that combines multiple screening profiles",
    {
      name: z.string().describe("Intersection config name"),
      description: z.string().optional().describe("Description"),
      pipeline: z.array(z.any()).describe("Pipeline steps defining which profiles to intersect"),
      scoring: z.record(z.any()).optional().describe("Scoring configuration"),
    },
    async (params) => {
      const result = await api.post("/screening/intersections", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_intersection_config",
    "Get a specific screening intersection configuration",
    {
      id: z.string().describe("Intersection config ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/screening/intersections/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_intersection_config",
    "Update a screening intersection configuration",
    {
      id: z.string().describe("Intersection config ID"),
      name: z.string().optional().describe("Updated name"),
      description: z.string().optional().describe("Updated description"),
      pipeline: z.array(z.any()).optional().describe("Updated pipeline steps"),
      scoring: z.record(z.any()).optional().describe("Updated scoring configuration"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/screening/intersections/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_intersection_config",
    "Archive a screening intersection configuration",
    {
      id: z.string().describe("Intersection config ID to archive"),
    },
    async ({ id }) => {
      const result = await api.delete(`/screening/intersections/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "run_intersection",
    "Run a screening intersection pipeline",
    {
      id: z.string().describe("Intersection config ID to run"),
      forceRefresh: z.boolean().optional().describe("Force refresh underlying screens"),
      dryRun: z.boolean().optional().describe("Dry run without persisting results"),
      syncToUniverse: z.boolean().optional().describe("Sync results to the investment universe"),
      triggeredBy: z.string().optional().describe("Who triggered the run"),
      triggerType: z.string().optional().describe("How it was triggered (manual, scheduled, etc.)"),
    },
    async ({ id, ...rest }) => {
      const result = await api.post(`/screening/intersections/${id}/run`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_intersection_runs",
    "List runs for a screening intersection configuration",
    {
      id: z.string().describe("Intersection config ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/screening/intersections/${id}/runs`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_intersection_run",
    "Get a specific intersection run with results",
    {
      id: z.string().describe("Intersection run ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/screening/intersection-runs/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_intersection_diff",
    "Compare two intersection runs to see what changed",
    {
      id: z.string().describe("Base intersection run ID"),
      otherId: z.string().describe("Other intersection run ID to compare against"),
    },
    async ({ id, otherId }) => {
      const result = await api.get(`/screening/intersection-runs/${id}/diff/${otherId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
