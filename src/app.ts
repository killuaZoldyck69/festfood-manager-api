import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib";
import { prisma } from "./lib/prisma";
import { logger } from "./shared/logger";
import { scanRoutes } from "./modules/scan";
import { inventoryRoutes } from "./modules/inventory";
import { adminRoutes } from "./modules/admin";
import { volunteerRoutes } from "./modules/volunteer";
import { notFoundHandler, globalErrorHandler } from "./middlewares";
import { ticketRoutes } from "./modules/tickets/tickets.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(pinoHttp({ logger }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);

app.post("/api/auth/sign-up/email", (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    message:
      "Public registration is disabled. Only Admins can create volunteer accounts.",
    errorSources: [],
  });
});

app.post("/api/auth/sign-in/email", async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;
    if (email && !email.includes("@")) {
      const user = await prisma.user.findFirst({ where: { phone: email } });
      if (user) {
        req.body.email = user.email;
      }
    }
  } catch (error) {
    logger.error(error, "Error resolving phone number for login");
  }
  next();
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/scan", scanRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/volunteer", volunteerRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
