import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(50),
});

export const inventoryBodySchema = z.object({
  totalAvailable: z
    .number({
      message: "Total available count is required and must be a number",
    })
    .int("Total available must be an integer")
    .nonnegative("Total available cannot be negative"),
});

export const overrideBodySchema = z.object({
  attendeeId: z
    .string({ message: "Attendee ID is required and must be a valid string" })
    .uuid("Invalid Attendee ID format"),
});

export const getLogsQuerySchema = paginationSchema.extend({
  status: z
    .enum(["ALL", "SUCCESS", "DUPLICATE", "INVALID", "MANUAL_OVERRIDE"])
    .optional()
    .default("ALL"),
  search: z.string().optional(),
});

export const getAttendeesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(25),
  status: z.enum(["ALL", "CLAIMED", "PENDING"]).default("ALL"),
  category: z.string().optional(),
  university: z.string().optional(),
});
