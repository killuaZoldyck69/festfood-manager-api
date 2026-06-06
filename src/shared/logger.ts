import pino from "pino";
import { envConfig } from "./config/env";

export const logger = pino({
  level: envConfig.NODE_ENV === "production" ? "info" : "debug",
  transport:
    envConfig.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});
