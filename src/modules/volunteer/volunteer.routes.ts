import { Router } from "express";
import { handleGetVolunteerLogs } from "./volunteer.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

// GET /api/volunteer/logs
// Protected by Auth so req.user exists
router.get("/logs", requireAuth, handleGetVolunteerLogs);

export const volunteerRoutes = router;
