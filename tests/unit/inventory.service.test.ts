import { describe, it, expect, vi, beforeEach } from "vitest";
import { getInventoryStats } from "../../src/modules/inventory/inventory.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Inventory Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct totalServed count", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 100,
    });
    prismaMock.attendee.count.mockResolvedValueOnce(25); // totalServed
    prismaMock.scanLog.count.mockResolvedValueOnce(0);
    prismaMock.scanLog.count.mockResolvedValueOnce(0);
    prismaMock.attendee.count.mockResolvedValueOnce(100);

    const stats = await getInventoryStats();
    expect(stats.totalServed).toBe(25);
  });

  it("returns correct totalAvailable from EventLogistics", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 75,
    });
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.totalAvailable).toBe(75);
  });

  it("returns 0 for totalAvailable when EventLogistics row is absent", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue(null);
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.totalAvailable).toBe(0);
  });

  it("returns correct percentageClaimed calculation", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 200,
    });
    prismaMock.attendee.count.mockResolvedValueOnce(50); // totalServed
    prismaMock.scanLog.count.mockResolvedValue(0);
    prismaMock.attendee.count.mockResolvedValueOnce(0);

    const stats = await getInventoryStats();
    expect(stats.percentageClaimed).toBe(25); // 50 / 200
  });

  it("handles zero totalAvailable without division by zero", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 0,
    });
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.percentageClaimed).toBe(0);
    expect(stats.totalAvailable).toBe(0);
  });
});
