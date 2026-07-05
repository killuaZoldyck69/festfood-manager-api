import request from "supertest";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { Request, Response } from "express";
import { DeepMockProxy } from "vitest-mock-extended";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { requireAdmin } from "../../src/middlewares/adminMiddleware";
import * as volunteerService from "../../src/modules/admin/services/volunteer.service";
import { PrismaClient } from "@prisma/client/extension";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Integration: Admin Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Security & Authorization", () => {
    it("returns 403 Forbidden if user is not an ADMIN", async () => {
      (requireAdmin as Mock).mockImplementationOnce(
        (req: Request, res: Response) => {
          return res.status(403).json({ message: "Forbidden: Admins only" });
        },
      );

      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: 1000 });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/v1/admin/inventory", () => {
    it("successfully updates the global inventory logistics", async () => {
      prismaMock.eventLogistics.upsert.mockResolvedValue({
        id: 1,
        totalAvailable: 1500,
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: 1500 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Inventory updated successfully.");
      expect(prismaMock.eventLogistics.upsert).toHaveBeenCalledTimes(1);
    });

    it("returns 400 if totalAvailable is missing or invalid", async () => {
      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: -50 });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/admin/override", () => {
    const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("successfully bypasses standard scan logic to mark food as claimed", async () => {
      prismaMock.attendee.findUnique.mockResolvedValue({
        id: fakeUuid,
        name: "Test Override User",
        email: "override@test.com",
        studentId: "001",
        university: "Test",
        role: "Student",
        segment: "General",
        semester: "Fall",
        team: "A",
        qrToken: "manual-token",
        foodClaimed: false,
        claimedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.eventLogistics.findUnique.mockResolvedValue({
        id: 1,
        totalAvailable: 50,
        updatedAt: new Date(),
      });

      prismaMock.attendee.count.mockResolvedValue(0);

      prismaMock.$transaction.mockResolvedValue([
        { id: fakeUuid, foodClaimed: true },
        { id: "log-1" },
      ]);

      const response = await request(app)
        .post("/api/v1/admin/override")
        .send({ attendeeId: fakeUuid });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Manual override successful");
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/v1/admin/volunteers", () => {
    it("successfully creates a new volunteer account", async () => {
      // 💥 Added createdAt back to satisfy the strict DTO requirements
      vi.spyOn(volunteerService, "registerVolunteerAccount").mockResolvedValue({
        id: "new-volunteer-id",
        name: "New Volunteer",
        email: "volunteer@fest.com",
        role: "VOLUNTEER",
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/v1/admin/volunteers")
        .send({
          name: "New Volunteer",
          email: "volunteer@fest.com",
          password: "SecurePassword123!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Volunteer registered successfully.");
      expect(volunteerService.registerVolunteerAccount).toHaveBeenCalledTimes(
        1,
      );
    });

    it("returns 400 if validation fails (e.g., weak password or bad email)", async () => {
      const response = await request(app)
        .post("/api/v1/admin/volunteers")
        .send({
          name: "",
          email: "not-an-email",
          password: "short",
        });

      expect(response.status).toBe(400);
    });
  });
});
