import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/adminMiddleware";
import {
  downloadAllTickets,
  downloadTempPdf,
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
router.get("/tickets/download-all", downloadAllTickets);
router.get("/tickets/download-temp/:filename", downloadTempPdf);

export { router as adminRoutes };
