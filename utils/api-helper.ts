import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number; // NEW: allow per-call timeout
  failOnStatusCode?: boolean; // NEW: pass-through for strict mode
}

/**
 * APIHelper
 * Handles API requests with Allure logging + auto-authentication.
 */
export class APIHelper {
  private authToken: string | null = null;

  // NEW: environment-configurable reliability knobs with sane defaults
  private defaultTimeout = Number(process.env.API_DEFAULT_TIMEOUT ?? 15000);
  private retryCount = Number(process.env.API_RETRY_COUNT ?? 2);
  private initialBackoffMs = Number(process.env.API_RETRY_BACKOFF_MS ?? 250);

  constructor(private request: APIRequestContext) {}

  // Default headers
  private defaultHeaders = {
    Accept: "application/json", // NEW: always ask for JSON
    "Content-Type": "application/json",
    // NEW: default API key header (kept here AND overridable per request)
    "X-API-KEY": process.env.REQRES_API_KEY ?? "reqres-free-v1",
  };

  /** -------------------- AUTH MANAGEMENT -------------------- **/

  setAuthToken(token: string) {
    this.authToken = token;
    console.log(`🔑 Auth token set`);
  }

  clearAuthToken() {
    this.authToken = null;
    console.log(`🔑 Auth token cleared`);
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  /** -------------------- HTTP METHODS -------------------- **/

  async get(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    return this.send("GET", endpoint, undefined, options);
  }

  async post(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse> {
    return this.send("POST", endpoint, body, options);
  }

  async put(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse> {
    return this.send("PUT", endpoint, body, options);
  }

  async delete(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    return this.send("DELETE", endpoint, undefined, options);
  }

  /** -------------------- CORE REQUEST HANDLER -------------------- **/

  private async send(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse> {
    return allure.step(`${method}: ${endpoint}`, async () => {
      console.log(`${this.emoji(method)} ${method}: ${endpoint}`);

      // Merge default headers + token + custom (custom overrides default)
      const headers = {
        ...this.defaultHeaders,
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : {}),
        ...(options?.headers ?? {}),
      };

      // Build final request options (timeout, params, etc.)
      const finalTimeout = options?.timeout ?? this.defaultTimeout;
      const requestOptions: any = {
        method,
        headers,
        timeout: finalTimeout,
        failOnStatusCode: options?.failOnStatusCode, // optional
      };

      // Attach query string params only if provided
      if (options?.params) {
        requestOptions.params = options.params;
      }

      // Only attach data if body is defined (GET requests often have no body)
      if (body !== undefined) {
        requestOptions.data = body; // CRITICAL: this is how Playwright sends JSON
        await allure.attachment(
          "Request Body",
          JSON.stringify(body, null, 2),
          "application/json"
        );
      }

      await allure.attachment(
        "Request Headers",
        JSON.stringify(headers, null, 2),
        "application/json"
      );

      // Retry wrapper for transient issues and to keep stability
      const response = await this.requestWithRetry(endpoint, requestOptions);

      await this.logResponse(response);
      return response;
    });
  }

  /** -------------------- RETRY WRAPPER -------------------- **/

  private async requestWithRetry(endpoint: string, requestOptions: any) {
    let attempt = 0;
    let lastError: any;

    while (attempt <= this.retryCount) {
      try {
        // Use fetch to keep your chosen style (single entry point)
        const res = await this.request.fetch(endpoint, requestOptions);
        return res;
      } catch (error) {
        lastError = error;
        const backoff = this.initialBackoffMs * Math.pow(2, attempt);
        console.warn(
          `Attempt ${attempt + 1} failed for ${
            requestOptions.method
          } ${endpoint}. Retrying in ${backoff}ms...`
        );
        await new Promise((r) => setTimeout(r, backoff));
      }
      attempt++;
    }

    throw lastError;
  }

  /** -------------------- HELPERS -------------------- **/

  async validateResponse(response: APIResponse, expectedStatus: number) {
    return await allure.step(
      `Validate Response Status: ${expectedStatus}`,
      async () => {
        expect(response.status()).toBe(expectedStatus);
        console.log(`✅ Status: ${response.status()}`);
        return response;
      }
    );
  }

  private async logResponse(response: APIResponse) {
    try {
      const responseBody = await response.text();
      if (responseBody) {
        await allure.attachment(
          "Response Body",
          // Keep raw text; many APIs return JSON but some return plaintext
          responseBody,
          "application/json"
        );
      }
      const headers = response.headers();
      await allure.attachment(
        "Response Headers",
        JSON.stringify(headers, null, 2),
        "application/json"
      );
      await allure.attachment(
        "Response Status",
        String(response.status()),
        "text/plain"
      );
    } catch (error) {
      await allure.attachment("Error", String(error), "text/plain");
    }
  }

  async getResponseBody<T = any>(response: APIResponse): Promise<T> {
    try {
      return await response.json();
    } catch {
      return (await response.text()) as unknown as T;
    }
  }

  private emoji(method: string) {
    switch (method) {
      case "GET":
        return "🔍";
      case "POST":
        return "📤";
      case "PUT":
        return "🔄";
      case "DELETE":
        return "🗑️";
      default:
        return "🌐";
    }
  }
}
