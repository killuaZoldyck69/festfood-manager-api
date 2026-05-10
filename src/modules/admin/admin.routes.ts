// src/modules/admin/admin.routes.ts
import { Router } from "express";
import multer from "multer";
import {
  handleCsvUpload,
  handleGetAttendees,
  handleGetLogs,
  handleManualOverride,
  handleUpdateInventory,
} from "./admin.controller";
import { requireAuth } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/adminMiddleware";

const router = Router();

// Configure multer to store files in RAM (not on the hard drive)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/admin/upload
// Notice the middleware chain: Auth -> Admin Check -> File Upload
router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  handleCsvUpload,
);

router.put("/inventory", requireAuth, requireAdmin, handleUpdateInventory);

router.get("/attendees", requireAuth, requireAdmin, handleGetAttendees);

router.post("/override", requireAuth, requireAdmin, handleManualOverride);

router.get("/logs", requireAuth, requireAdmin, handleGetLogs);

export const adminRoutes = router;
