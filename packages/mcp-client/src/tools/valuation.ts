import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PrrmApiClient } from "../api-client.js";

export function registerValuationTools(server: McpServer, api: PrrmApiClient) {
  server.tool(
    "list_valuation_models",
    "List all available valuation models",
    {},
    async () => {
      const result = await api.get("/valuation/models");
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_valuation_model",
    "Get a specific valuation model by ID",
    {
      id: z.string().describe("Valuation model ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/valuation/models/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_valuation_model",
    "Create a new valuation model template",
    {
      name: z.string().describe("Model name"),
      type: z.enum(["dcf", "comparables", "ddm", "nav", "custom"]).describe("Model type"),
      template: z.record(z.any()).describe("Model template definition"),
      description: z.string().optional().describe("Model description"),
      author: z.string().optional().describe("Model author"),
    },
    async (params) => {
      const result = await api.post("/valuation/models", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_valuation_model",
    "Update an existing valuation model",
    {
      id: z.string().describe("Model ID to update"),
      name: z.string().optional().describe("Updated name"),
      description: z.string().optional().describe("Updated description"),
      template: z.record(z.any()).optional().describe("Updated template definition"),
    },
    async ({ id, ...rest }) => {
      const result = await api.patch(`/valuation/models/${id}`, rest);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "execute_valuation",
    "Execute a valuation model against an instrument with input data",
    {
      modelId: z.string().describe("Valuation model ID to execute"),
      instrumentId: z.string().describe("Target instrument ID"),
      inputData: z.record(z.any()).describe("Input data for the valuation model"),
      author: z.string().describe("Person running the valuation"),
    },
    async (params) => {
      const result = await api.post("/valuation/execute", params);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_valuation_output",
    "Get a specific valuation output by ID",
    {
      id: z.string().describe("Valuation output ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/valuation/outputs/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "list_valuations_by_instrument",
    "List all valuation outputs for a specific instrument",
    {
      instrument_id: z.string().describe("Instrument ID to get valuations for"),
    },
    async ({ instrument_id }) => {
      const result = await api.get("/valuation/outputs", { instrument_id });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Autofill ───────────────────────────────────────────

  server.tool(
    "autofill_valuation",
    "Auto-fill valuation model inputs from Borsdata data for an instrument",
    {
      modelId: z.number().describe("Valuation model ID"),
      instrumentId: z.number().describe("Instrument ID to pull data for"),
    },
    async ({ modelId, instrumentId }) => {
      const result = await api.get("/valuation/autofill", {
        modelId: modelId.toString(),
        instrumentId: instrumentId.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  // ─── Scenarios ──────────────────────────────────────────

  server.tool(
    "list_scenarios",
    "List valuation scenarios for an instrument",
    {
      instrumentId: z.number().describe("Instrument ID"),
    },
    async ({ instrumentId }) => {
      const result = await api.get("/valuation/scenarios", {
        instrumentId: instrumentId.toString(),
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "create_scenario",
    "Create a new valuation scenario",
    {
      data: z.record(z.any()).optional().describe("Scenario data"),
    },
    async ({ data }) => {
      const result = await api.post("/valuation/scenarios", data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_scenario",
    "Get a specific valuation scenario by ID",
    {
      id: z.string().describe("Scenario ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/valuation/scenarios/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "update_scenario",
    "Update an existing valuation scenario",
    {
      id: z.string().describe("Scenario ID"),
      data: z.record(z.any()).optional().describe("Fields to update"),
    },
    async ({ id, data }) => {
      const result = await api.patch(`/valuation/scenarios/${id}`, data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "delete_scenario",
    "Delete a valuation scenario",
    {
      id: z.string().describe("Scenario ID"),
    },
    async ({ id }) => {
      const result = await api.delete(`/valuation/scenarios/${id}`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "copy_scenario",
    "Create a copy of an existing valuation scenario",
    {
      id: z.string().describe("Scenario ID to copy"),
    },
    async ({ id }) => {
      const result = await api.post(`/valuation/scenarios/${id}/copy`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "execute_scenario",
    "Execute a valuation scenario to produce an output",
    {
      id: z.string().describe("Scenario ID to execute"),
    },
    async ({ id }) => {
      const result = await api.post(`/valuation/scenarios/${id}/execute`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "get_scenario_history",
    "Get version history for a valuation scenario",
    {
      id: z.string().describe("Scenario ID"),
    },
    async ({ id }) => {
      const result = await api.get(`/valuation/scenarios/${id}/history`);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "what_if_valuation",
    "Run a disposable what-if analysis on a scenario without saving",
    {
      id: z.string().describe("Scenario ID to base the what-if on"),
      data: z.record(z.any()).optional().describe("Override inputs for the what-if"),
    },
    async ({ id, data }) => {
      const result = await api.post(`/valuation/scenarios/${id}/what-if`, data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "compare_scenarios",
    "Compare multiple valuation scenarios side by side",
    {
      data: z.record(z.any()).optional().describe("Comparison parameters (e.g. scenario IDs)"),
    },
    async ({ data }) => {
      const result = await api.post("/valuation/scenarios/compare", data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    "export_scenarios_to_ic",
    "Export valuation scenarios to an IC meeting agenda",
    {
      data: z.record(z.any()).optional().describe("Export parameters (e.g. scenario IDs, meeting ID)"),
    },
    async ({ data }) => {
      const result = await api.post("/valuation/scenarios/export-to-ic", data);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
