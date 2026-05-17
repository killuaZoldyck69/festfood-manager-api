import { z } from "zod";

const paginationSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("50").transform(Number),
});

export const updateInventorySchema = z.object({
  body: z.object({
    totalAvailable: z
      .number({
        message: "Total available count is required and must be a number",
      })
      .int("Total available must be an integer")
      .nonnegative("Total available cannot be negative"),
  }),
});

export const overrideSchema = z.object({
  body: z.object({
    attendeeId: z
      .string({ message: "Attendee ID is required and must be a valid string" })
      .uuid("Invalid Attendee ID format"),
  }),
});

export const getLogsQuerySchema = z.object({
  query: paginationSchema.extend({
    status: z
      .enum(["ALL", "SUCCESS", "DUPLICATE", "INVALID", "MANUAL_OVERRIDE"])
      .optional()
      .default("ALL"),
  }),
});

export const getAttendeesQuerySchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    status: z.enum(["ALL", "CLAIMED", "PENDING"]).optional().default("ALL"),
  }),
});
