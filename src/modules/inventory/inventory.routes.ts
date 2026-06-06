import { Router } from "express";
import { handleGetInventory, handleGetHealth } from "./inventory.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/health", handleGetHealth);
router.get("/", requireAuth, handleGetInventory);

export const inventoryRoutes = router;
