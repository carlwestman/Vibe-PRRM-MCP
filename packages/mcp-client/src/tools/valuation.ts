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
      type: z.string().describe("Model type (e.g. dcf, comps, nav)"),
      description: z.string().optional().describe("Model description"),
      schema: z.record(z.any()).optional().describe("Input schema for the model"),
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
      schema: z.record(z.any()).optional().describe("Updated input schema"),
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

  server.tool(
    "link_valuation_to_report",
    "Link a valuation output to a research report",
    {
      report_id: z.string().describe("Research report ID"),
      valuation_output_id: z.string().describe("Valuation output ID to link"),
    },
    async ({ report_id, valuation_output_id }) => {
      const result = await api.post(`/research/${report_id}/link-valuation`, {
        valuation_output_id,
      });
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
}
