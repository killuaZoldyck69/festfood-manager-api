import request from "supertest";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { requireAuth } from "../../src/middlewares/authMiddleware";
import { Request, Response } from "express";

const prismaMock = prisma as any;

describe("Integration: POST /api/v1/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without auth token", async () => {
    (requireAuth as Mock).mockImplementationOnce(
      (req: Request, res: Response) => {
        return res.status(401).json({ message: "Unauthorized" });
      },
    );

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "123" });

    expect(response.status).toBe(401);
  });

  it("returns 400 with missing qrToken", async () => {
    const response = await request(app).post("/api/v1/scan").send({});
    expect(response.status).toBe(400);
  });

  it("returns 404 with unknown token", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    prismaMock.scanLog.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "unknown-token" });

    expect(response.status).toBe(404);
  });

  it("returns 200 with valid token", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 10,
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}, {}]);

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "valid-token" });

    expect(response.status).toBe(200);
  });

  it("returns 409 on duplicate scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    prismaMock.scanLog.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "used-token" });

    expect(response.status).toBe(409);
  });
});
