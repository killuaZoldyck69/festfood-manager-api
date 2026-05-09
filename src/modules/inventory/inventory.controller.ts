import { Request, Response } from "express";
import { getInventoryStats } from "./inventory.service";

export const handleGetInventory = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const stats = await getInventoryStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Inventory Controller Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch inventory statistics." });
  }
};
