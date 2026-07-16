import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(50),
});

export const inventoryBodySchema = z.object({
  totalBreakfastAvailable: z
    .number()
    .int()
    .min(0, "Total breakfast available cannot be negative"),
  totalLunchAvailable: z
    .number()
    .int()
    .min(0, "Total lunch available cannot be negative"),
});

export const overrideBodySchema = z.object({
  attendeeId: z
    .string({ message: "Attendee ID is required and must be a valid string" })
    .uuid("Invalid Attendee ID format"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "FOOD"]).optional(),
});

export const getLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  segment: z.string().optional(),
  volunteerEmail: z.string().optional(),
  mealType: z.string().optional(),
});

export const getAttendeesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(25),
  status: z.enum(["ALL", "CLAIMED", "PENDING"]).default("ALL"),
  segment: z.string().optional(),
  university: z.string().optional(),
  mealType: z.string().optional(),
});
