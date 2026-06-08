import { z } from "zod";
import { ScanStatus } from "../../../prisma/generated/enums";

export const getVolunteerLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ScanStatus).optional(),
  search: z.string().optional(),
});
