import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("Integration: Global App Configuration & Error Handling", () => {
  describe("404 Not Found Handler", () => {
    it("returns a structured 404 JSON response for completely unknown routes", async () => {
      const response = await request(app).get(
        "/api/v1/this-route-definitely-does-not-exist",
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/does not exist/i);
    });
  });

  describe("Global Error Handler", () => {
    it("gracefully catches syntax errors (like malformed JSON) without crashing", async () => {
      const response = await request(app)
        .post("/api/v1/scan")
        .set("Content-Type", "application/json")
        .send("{ completely malformed json syntax ]");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });
});
