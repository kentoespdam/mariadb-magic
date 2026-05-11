import { describe, it, expect, vi, beforeEach } from "vitest";
import { connectionService } from "./connections";
import { apiGet, apiPost, apiDelete } from "../apiClient";

describe("connectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should call apiGet with correct path", async () => {
      (apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      await connectionService.list();
      expect(apiGet).toHaveBeenCalledWith("/api/connections/");
    });
  });

  describe("get", () => {
    it("should call apiGet with correct path", async () => {
      (apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "1",
        name: "test",
      });
      await connectionService.get("1");
      expect(apiGet).toHaveBeenCalledWith("/api/connections/1");
    });
  });

  describe("create", () => {
    it("should call apiPost with correct path and body", async () => {
      const input = {
        name: "test",
        host: "localhost",
        port: 3306,
        user: "root",
      };
      (apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "1" });
      await connectionService.create(input);
      expect(apiPost).toHaveBeenCalledWith("/api/connections/", input);
    });
  });

  describe("delete", () => {
    it("should call apiDelete with correct path", async () => {
      (apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await connectionService.delete("1");
      expect(apiDelete).toHaveBeenCalledWith("/api/connections/1");
    });

    it("should include cascade query param when specified", async () => {
      (apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await connectionService.delete("1", { cascade: true });
      expect(apiDelete).toHaveBeenCalledWith("/api/connections/1?cascade=true");
    });
  });
});
