import { z } from "zod";

export const scanRequestSchema = z.object({
  qrToken: z
    .string({
      message: "QR Token is required and must be a valid string",
    })
    .min(1, "QR Token cannot be empty"),
});
