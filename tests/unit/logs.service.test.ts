import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSystemLogs,
  getLogFilterOptions,
} from "../../src/modules/admin/services/logs.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Logs Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSystemLogs", () => {
    it("fetches and maps paginated logs with search filters", async () => {
      prismaMock.scanLog.count.mockResolvedValue(1);
      prismaMock.scanLog.findMany.mockResolvedValue([
        {
          id: "log1",
          status: "SUCCESS",
          scannedToken: "123",
          scannedAt: new Date(),
          volunteer: { name: "V1" },
          attendee: { name: "A1" },
        },
      ]);

      const result = await getSystemLogs(1, 10, {
        status: "SUCCESS",
        search: "John",
      });

      expect(result.meta.total).toBe(1);
      expect(result.data[0].volunteerName).toBe("V1");
      // Verify search clause was built properly
      expect(prismaMock.scanLog.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "SUCCESS",
            attendee: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe("getLogFilterOptions", () => {
    it("aggregates and maps group categories and volunteers", async () => {
      // Mock Volunteer aggregations
      prismaMock.scanLog.groupBy.mockResolvedValueOnce([
        { volunteerId: "v1", _count: { id: 10 } },
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { id: "v1", name: "Vol Name", email: "v@test.com" },
      ]);

      // Mock Attendee aggregations
      prismaMock.scanLog.groupBy.mockResolvedValueOnce([
        { attendeeId: "a1", _count: { id: 5 } },
      ]);
      prismaMock.attendee.findMany.mockResolvedValue([
        { id: "a1", category: "Hackathon" },
      ]);

      const result = await getLogFilterOptions();

      expect(result.volunteers).toHaveLength(1);
      expect(result.volunteers[0].name).toBe("Vol Name");
      expect(result.volunteers[0].count).toBe(10);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe("Hackathon");
      expect(result.categories[0].count).toBe(5);
    });
  });
});
