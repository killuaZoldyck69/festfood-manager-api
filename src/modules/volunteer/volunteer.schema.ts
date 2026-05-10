// src/modules/volunteer/volunteer.schema.ts
import { z } from "zod";

export const getVolunteerLogsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10)),
    limit: z
      .string()
      .optional()
      .default("10") // Defaulting to 10 for the mobile app
      .transform((val) => parseInt(val, 10)),
    // We make status optional so if they don't send it, they get ALL their logs
    status: z.enum(["SUCCESS", "INVALID", "DUPLICATE"]).optional(),
  }),
});
