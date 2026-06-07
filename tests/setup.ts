import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "../prisma/generated/client";
import { prisma } from "../src/lib/prisma";

// 1. Tell Vitest to mock the prisma library
vi.mock("../src/lib/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// 2. Reset the mock before every single test so data doesn't leak
beforeEach(() => {
  mockReset(prisma);
});

// 3. Mock the Better-Auth middleware so we can bypass authentication in tests
vi.mock("../src/middlewares/authMiddleware", () => ({
  requireAuth: vi.fn((req, res, next) => {
    req.user = { id: "test-volunteer-id", role: "VOLUNTEER" };
    next();
  }),
}));

vi.mock("../src/middlewares/adminMiddleware", () => ({
  requireAdmin: vi.fn((req, res, next) => {
    req.user = { id: "test-admin-id", role: "ADMIN" };
    next();
  }),
}));
