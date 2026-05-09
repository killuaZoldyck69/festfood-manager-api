// src/modules/inventory/inventory.routes.ts
import { Router } from "express";
import { handleGetInventory } from "./inventory.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

// GET /api/inventory
router.get("/", requireAuth, handleGetInventory);

export const inventoryRoutes = router;
