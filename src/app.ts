import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { scanRoutes } from "./modules/scan/scan.routes";
import { inventoryRoutes } from "./modules/inventory/inventory.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { volunteerRoutes } from "./modules/volunteer/volunteer.routes";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://192.168.0.102:8081",
      "http://localhost:8081",
      "http://192.168.0.101:8081",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res
      .status(200)
      .json({
        status: "Healthy",
        uptime: process.uptime(),
        database: "Connected",
      });
  } catch (error) {
    res.status(500).json({ status: "Offline", database: "Disconnected" });
  }
});

app.use("/api/scan", scanRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/volunteer", volunteerRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
