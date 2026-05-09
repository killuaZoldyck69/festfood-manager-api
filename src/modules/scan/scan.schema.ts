// src/modules/scan/scan.schema.ts
import { z } from "zod";

export const scanRequestSchema = z.object({
  body: z.object({
    qrToken: z
      .string({
        message: "QR Token is required and must be a valid string",
      })
      .min(1, "QR Token cannot be empty"),
  }),
});
