import { Router } from "express";
import { handleGetVolunteerLogs } from "./volunteer.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/logs", requireAuth, handleGetVolunteerLogs);

export { router as volunteerRoutes };
