import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const urlValidator = z.string().refine(
  (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid URL format" },
);

const envSchema = z.object({
  DATABASE_URL: urlValidator,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: urlValidator,
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: urlValidator.optional(),
  BACKEND_URL: urlValidator.optional(),
  BREVO_API_KEY: z.string().min(1, "Brevo API key is required"),
  TRUSTED_ORIGINS: z.string().optional(),
  FROM_EMAIL: z.email("FROM_EMAIL must be a valid email"),
});

export const envConfig = envSchema.parse(process.env);
