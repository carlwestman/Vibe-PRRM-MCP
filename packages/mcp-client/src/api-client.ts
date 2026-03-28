const debug = process.env.PRRM_MCP_DEBUG === "true";

function log(method: string, path: string, status?: number) {
  if (debug) {
    const ts = new Date().toISOString();
    process.stderr.write(`[prrm-mcp ${ts}] ${method} ${path}${status != null ? ` → ${status}` : ""}\n`);
  }
}

export class PrrmApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = token;
  }

  private headers(hasBody: boolean): Record<string, string> {
    const h: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    if (hasBody) h["Content-Type"] = "application/json";
    return h;
  }

  private buildUrl(path: string, params?: Record<string, string | undefined>): string {
    const url = new URL(`/api/v1${path}`, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, v);
        }
      }
    }
    return url.toString();
  }

  private async request(method: string, path: string, opts?: {
    params?: Record<string, string | undefined>;
    body?: unknown;
  }): Promise<unknown> {
    const url = this.buildUrl(path, opts?.params);
    const hasBody = opts?.body !== undefined;

    log(method, path);

    const res = await fetch(url, {
      method,
      headers: this.headers(hasBody),
      body: hasBody ? JSON.stringify(opts!.body) : undefined,
    });

    log(method, path, res.status);

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      if (!res.ok) return { error: text || `HTTP ${res.status}` };
      return text;
    }

    if (!res.ok) {
      if (res.status === 401) {
        return { error: "Authentication failed — check PRRM_API_TOKEN" };
      }
      if (res.status === 404) {
        return { error: json?.error || "Not found" };
      }
      return { error: json?.error || json?.message || `HTTP ${res.status}` };
    }

    // Unwrap standard { data: ... } envelope
    if (json && typeof json === "object" && "data" in json) {
      return json.data;
    }
    return json;
  }

  async get(path: string, params?: Record<string, string | undefined>): Promise<unknown> {
    return this.request("GET", path, { params });
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    return this.request("POST", path, { body });
  }

  async put(path: string, body?: unknown): Promise<unknown> {
    return this.request("PUT", path, { body });
  }

  async patch(path: string, body?: unknown): Promise<unknown> {
    return this.request("PATCH", path, { body });
  }

  async delete(path: string): Promise<unknown> {
    return this.request("DELETE", path);
  }
}
