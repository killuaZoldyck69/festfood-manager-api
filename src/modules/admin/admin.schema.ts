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
