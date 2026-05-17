import { z } from "zod";

export const getVolunteerLogsSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1").transform(Number),
    limit: z.string().optional().default("10").transform(Number),
    status: z
      .enum(["SUCCESS", "INVALID", "DUPLICATE", "MANUAL_OVERRIDE"])
      .optional(),
  }),
});
