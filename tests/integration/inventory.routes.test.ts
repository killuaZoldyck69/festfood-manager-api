import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepMockProxy } from "vitest-mock-extended";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { PrismaClient } from "../../prisma/generated/client";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Integration: Inventory Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/inventory", () => {
    it("returns 200 and calculates live inventory statistics", async () => {
      // Mock the 5 parallel database queries from the service
      prismaMock.eventLogistics.findUnique.mockResolvedValue({
        id: 1,
        totalAvailable: 500,
        updatedAt: new Date(),
      });
      prismaMock.attendee.count.mockResolvedValueOnce(150); // totalServed
      prismaMock.scanLog.count.mockResolvedValueOnce(10); // duplicateScans
      prismaMock.scanLog.count.mockResolvedValueOnce(5); // invalidTickets
      prismaMock.attendee.count.mockResolvedValueOnce(1000); // totalParticipants

      const response = await request(app).get("/api/v1/inventory");

      expect(response.status).toBe(200);
      expect(response.body.totalAvailable).toBe(500);
      expect(response.body.totalServed).toBe(150);
      expect(response.body.totalParticipants).toBe(1000);
      expect(response.body.duplicateScans).toBe(10);
      expect(response.body.invalidTickets).toBe(5);
      expect(response.body.percentageClaimed).toBe(30); // (150 / 500) * 100
    });
  });

  describe("GET /api/v1/inventory/health", () => {
    it("returns 200 and 'up' status if the database is connected", async () => {
      prismaMock.$queryRaw.mockResolvedValue([1]);

      const response = await request(app).get("/api/v1/inventory/health");

      expect(response.status).toBe(200);
      expect(response.body.database.status).toBe("up");
      expect(response.body.uptime).toBeDefined();
    });

    it("returns 503 and 'down' status if the database query fails", async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error("Connection refused"));

      const response = await request(app).get("/api/v1/inventory/health");

      expect(response.status).toBe(503);
      expect(response.body.database.status).toBe("down");
    });
  });
});
