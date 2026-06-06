import { Request, Response } from "express";
import { getInventoryStats, getSystemHealth } from "./inventory.service";
import { catchAsync } from "../../shared/catchAsync";

export const handleGetInventory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const stats = await getInventoryStats();
    res.status(200).json(stats);
  },
);

export const handleGetHealth = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const health = await getSystemHealth();
    const statusCode = health.database.status === "up" ? 200 : 503;
    res.status(statusCode).json(health);
  },
);
