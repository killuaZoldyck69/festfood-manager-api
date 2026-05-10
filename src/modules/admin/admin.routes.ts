// src/modules/admin/admin.routes.ts
import { Router } from "express";
import multer from "multer";
import { handleCsvUpload } from "./admin.controller";
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

export const adminRoutes = router;
