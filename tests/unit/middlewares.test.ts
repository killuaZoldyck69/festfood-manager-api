import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

// 💥 FIX: Explicitly unmock the middlewares to override tests/setup.ts!
vi.unmock("../../src/middlewares/authMiddleware");
vi.unmock("../../src/middlewares/adminMiddleware");

// 1. Mock Better Auth so it doesn't try to read from the database
vi.mock("../../src/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../../src/lib/auth";
import { requireAuth } from "../../src/middlewares/authMiddleware";
import { requireAdmin } from "../../src/middlewares/adminMiddleware";

describe("Unit: Middlewares", () => {
  const mockNext = vi.fn() as NextFunction;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("requireAuth", () => {
    it("returns 401 if session is missing", async () => {
      // Mock Better Auth to return no active session
      (auth.api.getSession as any).mockResolvedValue(null);

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() if session exists and attaches user to req", async () => {
      // Mock Better Auth to return a valid session
      (auth.api.getSession as any).mockResolvedValue({
        user: { id: "1", role: "VOLUNTEER" },
      });

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user.id).toBe("1");
    });
  });

  describe("requireAdmin", () => {
    it("returns 403 if user is not an ADMIN", () => {
      // Manually attach a VOLUNTEER user to the request
      mockRequest.user = { id: "1", role: "VOLUNTEER" } as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() if user is an ADMIN", () => {
      // Manually attach an ADMIN user to the request
      mockRequest.user = { id: "2", role: "ADMIN" } as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
