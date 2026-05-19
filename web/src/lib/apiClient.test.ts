import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError, generateCorrelationId, apiGet, apiPost } from "./apiClient";

global.fetch = vi.fn();

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateCorrelationId", () => {
    it("should return a valid UUID", () => {
      const id = generateCorrelationId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("apiGet", () => {
    it("should return data on success", async () => {
      const mockData = { id: "1", name: "test" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockData),
        headers: new Map([["X-Correlation-ID", "corr-id"]]),
      });

      const result = await apiGet<{ id: string }>("/api/test");
      expect(result).toEqual(mockData);
    });

    it("should handle 204 No Content", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => "",
        headers: new Map(),
      });

      const result = await apiGet<void>("/api/test");
      expect(result).toEqual({});
    });

    it("should throw ApiError on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Not found" },
          }),
        headers: new Map(),
      });

      await expect(apiGet("/api/test")).rejects.toThrow(ApiError);
    });
  });

  describe("apiPost", () => {
    it("should send JSON body and return data", async () => {
      const mockData = { id: "1" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockData),
        headers: new Map(),
      });

      await apiPost<{ id: string }, { name: string }>("/api/test", {
        name: "test",
      });
      expect(fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        }),
      );
    });

    it("should throw ApiError on non-2xx status", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () =>
          JSON.stringify({
            error: { code: "INTERNAL_ERROR", message: "Server error" },
          }),
        headers: new Map(),
      });

      await expect(apiPost("/api/test", {})).rejects.toThrow(ApiError);
    });
  });
});
