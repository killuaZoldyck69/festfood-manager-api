import { describe, it, expect } from "vitest";
import { handlePrismaError } from "../../src/errors/formatters/handlePrismaError";
import { Prisma } from "../../prisma/generated/client";

describe("Unit: Prisma Error Formatter", () => {
  it("handles P2002 Unique Constraint errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Conflict", {
      code: "P2002",
      clientVersion: "5.0.0",
      meta: { target: ["email"] },
    });

    const appError = handlePrismaError(error);
    expect(appError.statusCode).toBe(409);
    expect(appError.message).toBe("Duplicate Entry");
  });

  it("handles P2025 Record Not Found errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "5.0.0",
      meta: { cause: "Record to update not found." },
    });

    const appError = handlePrismaError(error);
    expect(appError.statusCode).toBe(404);
    expect(appError.message).toBe("Record not found");
  });

  it("handles generic Prisma Initialization errors", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "Could not connect to DB",
      "5.0.0",
    );
    const appError = handlePrismaError(error as any);
    expect(appError.statusCode).toBe(400);
    expect(appError.message).toBe("Database Error");
  });

  it("handles generic Prisma Validation errors", () => {
    const error = new Prisma.PrismaClientValidationError("Invalid field", {
      clientVersion: "5.0.0",
    });
    const appError = handlePrismaError(error as any);
    expect(appError.statusCode).toBe(400);
    expect(appError.message).toBe("Database Error");
  });
});
