import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib";
import { envConfig } from "./shared/config/env";
import { logger } from "./shared/logger";
import { scanRoutes } from "./modules/scan";
import { inventoryRoutes } from "./modules/inventory";
import { adminRoutes } from "./modules/admin";
import { volunteerRoutes } from "./modules/volunteer";
import { notFoundHandler, globalErrorHandler } from "./middlewares";

const app = express();

app.use(helmet());

const allowedOrigins =
  envConfig.NODE_ENV === "production"
    ? [envConfig.APP_URL as string]
    : ["http://localhost:8081", "http://192.168.0.101:8081"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(pinoHttp({ logger }));

app.post("/api/auth/sign-up/email", (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    message:
      "Public registration is disabled. Only Admins can create volunteer accounts.",
    errorSources: [],
  });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/scan", scanRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/volunteer", volunteerRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
