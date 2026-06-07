import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerVolunteerAccount,
  getVolunteersList,
  removeVolunteer,
} from "../../src/modules/admin/services/volunteer.service";
import { prisma } from "../../src/lib/prisma";
import { auth } from "../../src/lib/auth";
import { AppError } from "../../src/errors/AppError";

const prismaMock = prisma as any;

vi.mock("../../src/lib/auth", () => ({
  auth: { api: { signUpEmail: vi.fn() } },
}));

describe("Unit: Volunteer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerVolunteerAccount", () => {
    it("throws 400 if user email already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "existing" });
      await expect(
        registerVolunteerAccount("Name", "test@test.com", "pass"),
      ).rejects.toThrow(AppError);
    });

    it("registers user and returns DTO", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (auth.api.signUpEmail as any).mockResolvedValue({
        user: {
          id: "new-id",
          name: "Name",
          email: "test@test.com",
          role: "VOLUNTEER",
          createdAt: new Date(),
        },
      });

      const res = await registerVolunteerAccount(
        "Name",
        "test@test.com",
        "pass",
      );
      expect(res.id).toBe("new-id");
      expect(auth.api.signUpEmail).toHaveBeenCalled();
    });
  });

  describe("getVolunteersList", () => {
    it("maps raw DB data to VolunteerListItem list", async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: "1",
          name: "Vol 1",
          email: "v1@test.com",
          role: "VOLUNTEER",
          createdAt: new Date(),
          _count: { scanLogs: 5 },
        },
      ]);

      const res = await getVolunteersList();
      expect(res).toHaveLength(1);
      expect(res[0].totalScans).toBe(5);
    });
  });

  describe("removeVolunteer", () => {
    it("throws 404 if volunteer not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(removeVolunteer("bad-id")).rejects.toThrow(AppError);
    });

    it("throws 403 if trying to delete an ADMIN", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      await expect(removeVolunteer("admin-id")).rejects.toThrow(AppError);
    });

    it("soft deletes the volunteer", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ role: "VOLUNTEER" });
      prismaMock.user.update.mockResolvedValue({});

      await removeVolunteer("vol-id");
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { deletedAt: expect.any(Date) } }),
      );
    });
  });
});
