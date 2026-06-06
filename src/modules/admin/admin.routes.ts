import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { requireAuth, requireAdmin } from "../../middlewares";
import { AppError } from "../../errors/AppError";
import {
  createVolunteer,
  deleteVolunteerController,
  downloadAllTickets,
  downloadTempPdf,
  getVolunteers,
  handleCsvUpload,
  handleGetAttendeeFilters,
  handleGetAttendees,
  handleGetLogFilters,
  handleGetLogs,
  handleManualOverride,
  handleUpdateInventory,
  resetDatabase,
  resetLogistics,
} from "./admin.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isCSV =
      file.mimetype === "text/csv" || file.originalname.endsWith(".csv");
    if (isCSV) {
      cb(null, true);
    } else {
      cb(new AppError(400, "Only CSV files are allowed."));
    }
  },
});

const volunteerCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many volunteer creation attempts. Please try again later.",
    errorSources: [],
  },
});

router.use(requireAuth, requireAdmin);

router.post("/upload", upload.single("file"), handleCsvUpload);
router.put("/inventory", handleUpdateInventory);
router.get("/attendees", handleGetAttendees);
router.post("/override", handleManualOverride);
router.get("/logs", handleGetLogs);
router.get("/tickets/download-all", downloadAllTickets);
router.get("/tickets/download-temp/:filename", downloadTempPdf);

router.delete("/attendees/wipe", resetDatabase);
router.post("/logistics/reset", resetLogistics);

router.get("/volunteers", getVolunteers);
router.post("/volunteers", volunteerCreationLimiter, createVolunteer);
router.delete("/volunteers/:id", deleteVolunteerController);

router.get("/attendees/filters", handleGetAttendeeFilters);
router.get("/logs/filters", handleGetLogFilters);

export const adminRoutes = router;
