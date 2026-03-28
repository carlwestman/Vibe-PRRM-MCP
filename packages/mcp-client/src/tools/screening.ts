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
      description: z.string().optional().describe("Profile description"),
      criteria: z.array(z.object({
        kpi: z.string().describe("KPI identifier"),
        operator: z.string().describe("Comparison operator (gt, lt, gte, lte, eq)"),
        value: z.number().describe("Threshold value"),
      })).describe("Screening criteria"),
      universe: z.string().optional().describe("Universe to screen against"),
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
      description: z.string().optional().describe("Updated description"),
      criteria: z.array(z.object({
        kpi: z.string().describe("KPI identifier"),
        operator: z.string().describe("Comparison operator"),
        value: z.number().describe("Threshold value"),
      })).optional().describe("Updated criteria"),
      universe: z.string().optional().describe("Updated universe"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/screening/profiles/${id}`, rest);
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
    "Get available screening classifications",
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
      flagged: z.boolean().optional().describe("Filter to flagged instruments only"),
      dismissed: z.boolean().optional().describe("Filter to dismissed instruments only"),
    },
    async (params) => {
      const result = await api.get("/universe", {
        flagged: params.flagged?.toString(),
        dismissed: params.dismissed?.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
