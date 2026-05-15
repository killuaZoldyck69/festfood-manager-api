import { z } from "zod";

export const updateInventorySchema = z.object({
  body: z.object({
    totalAvailable: z
      .number({
        message: "Total available count is required and must be a number",
      })
      .int("Total available must be an integer") // Optional: Custom message for decimals
      .nonnegative("Total available cannot be negative"),
  }),
});

export const overrideSchema = z.object({
  body: z.object({
    attendeeId: z
      .string({
        message: "Attendee ID is required and must be a valid string",
      })
      .uuid("Invalid Attendee ID format"),
  }),
});

export const getLogsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10)),
    limit: z
      .string()
      .optional()
      .default("50")
      .transform((val) => parseInt(val, 10)),
  }),
});

export const getAttendeesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["ALL", "CLAIMED", "PENDING"]).optional().default("ALL"),
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10)),
    limit: z
      .string()
      .optional()
      .default("50")
      .transform((val) => parseInt(val, 10)),
  }),
});
