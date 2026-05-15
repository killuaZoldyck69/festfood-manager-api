import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/adminMiddleware";
import {
  handleCsvUpload,
  handleGetAttendees,
  handleGetLogs,
  handleManualOverride,
  handleUpdateInventory,
} from "./admin.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth, requireAdmin);

router.post("/upload", upload.single("file"), handleCsvUpload);
router.put("/inventory", handleUpdateInventory);
router.get("/attendees", handleGetAttendees);
router.post("/override", handleManualOverride);
router.get("/logs", handleGetLogs);

export { router as adminRoutes };
