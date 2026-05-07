// src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma";

// Initialize instances
const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------

// Health Check Route (Strategy A)
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    // Ping the database to ensure it's alive
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "Healthy",
      uptime: process.uptime(),
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({ status: "Offline", database: "Disconnected" });
  }
});

// Future routes will be mounted here
// app.use('/api/auth', authMiddleware);
// app.use('/api/scan', scanRouter);

export default app;
