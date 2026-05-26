import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/adminMiddleware";
import {
  createVolunteer,
  deleteVolunteerController,
  downloadAllTickets,
  downloadTempPdf,
  getVolunteers,
  handleCsvUpload,
  handleGetAttendees,
  handleGetLogs,
  handleManualOverride,
  handleUpdateInventory,
  resetDatabase,
  resetLogistics,
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

// --- DANGER ZONE ROUTES ---
// router.use(requireAdmin); // Apply admin-only protection here

router.delete("/attendees/wipe", resetDatabase);
router.post("/logistics/reset", resetLogistics);

// --- VOLUNTEER MANAGEMENT ROUTES ---
router.get("/volunteers", getVolunteers);
router.post("/volunteers", createVolunteer);
router.delete("/volunteers/:id", deleteVolunteerController);

export { router as adminRoutes };
