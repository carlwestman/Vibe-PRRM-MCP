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
      scope: z.string().describe("Screening scope: nordic or global"),
      description: z.string().optional().describe("Profile description"),
      criteria: z.array(z.object({
        metricId: z.string().describe("Metric ID in borsdata:KPI_ID format, e.g. borsdata:2"),
        calcGroup: z.string().describe("Time period: last, 1year, 3year, 5year, 7year, 10year"),
        calc: z.string().describe("Calculation: latest, mean, high, low, cagr, stabil"),
        operator: z.string().describe("Comparison: greater_than, less_than, between, equal, top_n, bottom_n"),
        value: z.any().describe("Threshold value"),
        valueMax: z.any().optional().describe("Upper bound for between operator"),
      })).describe("Screening criteria"),
      includeFilters: z.record(z.any()).describe("Include filters (pass {} if none)"),
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
      scope: z.string().optional().describe("Updated scope: nordic or global"),
      description: z.string().optional().describe("Updated description"),
      criteria: z.array(z.object({
        metricId: z.string().describe("Metric ID in borsdata:KPI_ID format, e.g. borsdata:2"),
        calcGroup: z.string().describe("Time period: last, 1year, 3year, 5year, 7year, 10year"),
        calc: z.string().describe("Calculation: latest, mean, high, low, cagr, stabil"),
        operator: z.string().describe("Comparison: greater_than, less_than, between, equal, top_n, bottom_n"),
        value: z.any().describe("Threshold value"),
        valueMax: z.any().optional().describe("Upper bound for between operator"),
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
    "evaluate_instrument_against_profile",
    "Evaluate a single instrument against a screening profile's criteria",
    {
      profileId: z.string().describe("Screening profile ID"),
      instrumentId: z.string().describe("Instrument ID to evaluate"),
    },
    async ({ profileId, instrumentId }) => {
      const result = await api.get(`/screening/profiles/${profileId}/evaluate/${instrumentId}`);
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
      pipeline: z.array(z.union([
        z.object({
          type: z.literal("gate").describe("Gate: instrument must pass this profile"),
          profileId: z.number().describe("Screening profile ID"),
        }),
        z.object({
          type: z.literal("threshold").describe("Threshold: instrument must pass min of these profiles"),
          profileIds: z.array(z.number()).describe("Screening profile IDs"),
          min: z.number().describe("Minimum number of profiles that must pass"),
        }),
      ])).describe("Pipeline stages — gate (single profile, must pass) or threshold (multiple profiles, min N must pass)"),
      scoring: z.object({
        profileWeights: z.record(z.number()).optional().describe("Profile ID to weight mapping, e.g. { '1': 0.5, '2': 0.3 }"),
      }).optional().describe("Scoring configuration"),
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
      pipeline: z.array(z.union([
        z.object({
          type: z.literal("gate"),
          profileId: z.number().describe("Screening profile ID"),
        }),
        z.object({
          type: z.literal("threshold"),
          profileIds: z.array(z.number()).describe("Screening profile IDs"),
          min: z.number().describe("Minimum number of profiles that must pass"),
        }),
      ])).optional().describe("Updated pipeline stages"),
      scoring: z.object({
        profileWeights: z.record(z.number()).optional().describe("Profile ID to weight mapping"),
      }).optional().describe("Updated scoring configuration"),
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

  // ─── Universe management ────────────────────────────────

  server.tool(
    "get_current_universe",
    "Get the current active investment universe",
    {},
    async () => {
      const result = await api.get("/universe/current");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_universe_versions",
    "List historical universe versions",
    {
      limit: z.number().optional().describe("Max results"),
      offset: z.number().optional().describe("Pagination offset"),
    },
    async (params) => {
      const result = await api.get("/universe/versions", {
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_universe_version",
    "Get a specific universe version by ID",
    {
      id: z.string().describe("Universe version ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/universe/versions/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_universe_diff",
    "Diff two universe versions to see what changed",
    {
      from: z.number().describe("Source universe version ID"),
      to: z.number().describe("Target universe version ID"),
    },
    async ({ from, to }) => {
      const result = await api.get("/universe/diff", {
        from: from.toString(),
        to: to.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_universe_staleness",
    "Check how stale the current universe is relative to latest screening runs",
    {},
    async () => {
      const result = await api.get("/universe/staleness");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_position_alerts",
    "Get position-level alerts for the universe (e.g. missing data, stale prices)",
    {},
    async () => {
      const result = await api.get("/universe/alerts");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_universe_overrides",
    "Get active manual overrides on the universe",
    {},
    async () => {
      const result = await api.get("/universe/overrides");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "propose_universe",
    "Create a universe proposal from an intersection run",
    {
      intersectionRunId: z.number().describe("Intersection run ID to base the proposal on"),
      selectedResultIds: z.array(z.number()).optional().describe("Specific result IDs to include"),
      overrides: z.array(z.any()).optional().describe("Manual override entries"),
      proposedBy: z.string().optional().describe("Who is proposing the change"),
    },
    async (params) => {
      const result = await api.post("/universe/propose", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_proposal",
    "Get a universe proposal by ID",
    {
      id: z.string().describe("Proposal ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/universe/proposals/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_proposal_instrument",
    "Toggle whether an instrument is included in a universe proposal",
    {
      id: z.string().describe("Proposal ID"),
      instId: z.string().describe("Instrument ID"),
      included: z.boolean().describe("Whether to include the instrument"),
    },
    async ({ id, instId, included }) => {
      const result = await api.patch(`/universe/proposals/${id}/instruments/${instId}`, { included });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "add_override_to_proposal",
    "Add a manual override instrument to a universe proposal",
    {
      id: z.string().describe("Proposal ID"),
      borsdataInsId: z.number().describe("Borsdata instrument ID to add"),
      displayName: z.string().describe("Display name for the instrument"),
      rationale: z.string().describe("Reason for the manual override"),
    },
    async ({ id, ...rest }) => {
      const result = await api.post(`/universe/proposals/${id}/overrides`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "remove_override_from_proposal",
    "Remove a manual override instrument from a universe proposal",
    {
      id: z.string().describe("Proposal ID"),
      instId: z.string().describe("Instrument ID to remove"),
    },
    async ({ id, instId }) => {
      const result = await api.delete(`/universe/proposals/${id}/overrides/${instId}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "commit_universe",
    "Commit a universe proposal, replacing the current active universe",
    {
      proposalId: z.number().describe("Proposal ID to commit"),
    },
    async ({ proposalId }) => {
      const result = await api.put("/universe/replace", { proposalId });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_universe_override",
    "Add a manual override instrument directly to the universe",
    {
      displayName: z.string().describe("Instrument display name"),
      rationale: z.string().describe("Reason for the manual override"),
      ticker: z.string().optional().describe("Ticker symbol"),
      assetClass: z.string().optional().describe("Asset class"),
      sector: z.string().optional().describe("Sector"),
      country: z.string().optional().describe("Country"),
      exchange: z.string().optional().describe("Exchange"),
      currency: z.string().optional().describe("Currency"),
      borsdataInsId: z.number().optional().describe("Borsdata instrument ID"),
      borsdataUrlName: z.string().optional().describe("Borsdata URL name"),
      instrumentId: z.number().optional().describe("Existing instrument ID to link"),
      externalIds: z.array(z.any()).optional().describe("External identifiers"),
    },
    async (params) => {
      const result = await api.post("/universe/overrides", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "bulk_create_instruments",
    "Bulk-create instruments from a universe version's instrument list",
    {
      versionInstrumentIds: z.array(z.number()).describe("Universe version instrument IDs to create as instruments"),
    },
    async (params) => {
      const result = await api.post("/universe/bulk-create-instruments", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
