import { describe, it, expect, vi, beforeEach } from "vitest";
import { processScan } from "../../src/modules/scan/scan.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Scan Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns INVALID when token does not exist in database", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    prismaMock.scanLog.create.mockResolvedValue({});

    const result = await processScan("fake-token", "vol-1");
    expect(result.status).toBe("INVALID");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("returns DUPLICATE when attendee.foodClaimed is true", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    prismaMock.scanLog.create.mockResolvedValue({});

    const result = await processScan("used-token", "vol-1");
    expect(result.status).toBe("DUPLICATE");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("returns DEPLETED when inventory is zero", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 0,
    });

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("DEPLETED");
  });

  it("returns DEPLETED when EventLogistics row does not exist", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue(null);

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("DEPLETED");
  });

  it("returns SUCCESS and decrements inventory by 1, updating attendee foodClaimed", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 50,
    });
    prismaMock.$transaction.mockResolvedValue([
      { id: "1", foodClaimed: true },
      {},
      { count: 1 },
    ]);

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("SUCCESS");
    expect(prismaMock.$transaction).toHaveBeenCalled();

    const transactionArgs = prismaMock.$transaction.mock.calls[0][0];
    expect(transactionArgs).toHaveLength(3);
  });

  it("creates ScanLog entry for every scan regardless of outcome", async () => {
    // Test INVALID path
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    await processScan("fake", "vol-1");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();

    // Test DUPLICATE path
    vi.clearAllMocks();
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    await processScan("used", "vol-1");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("does not decrement inventory on INVALID scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    await processScan("fake-token", "vol-1");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.eventLogistics.updateMany).not.toHaveBeenCalled();
  });

  it("does not decrement inventory on DUPLICATE scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    await processScan("used-token", "vol-1");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.eventLogistics.updateMany).not.toHaveBeenCalled();
  });
});
