import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware";
import { handleScan } from "./scan.controller";

const router = Router();

// POST /api/scan
router.post("/", requireAuth, handleScan);

export const scanRoutes = router;
