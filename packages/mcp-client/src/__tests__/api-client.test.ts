import { describe, it, expect, beforeAll } from "vitest";
import { PrrmApiClient } from "../api-client.js";

const BASE_URL = process.env.PRRM_BASE_URL || "http://localhost:3000";
const TOKEN = process.env.PRRM_API_TOKEN || "d9c8081247636416b1417b408f6c6b446f6b02ba6f5f003397594a6b143669e1";

let api: PrrmApiClient;

beforeAll(() => {
  api = new PrrmApiClient(BASE_URL, TOKEN);
});

describe("PrrmApiClient", () => {
  it("GET unwraps data envelope", async () => {
    const result = await api.get("/strategy") as any;
    expect(result).toHaveProperty("content");
    expect(typeof result.content).toBe("string");
  });

  it("GET with query params returns paginated data", async () => {
    const result = await api.get("/instruments", { limit: "1" }) as any;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("GET 404 returns error object with message string", async () => {
    const result = await api.get("/instruments/99999") as any;
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
    expect(result.error).toContain("not found");
  });
});
