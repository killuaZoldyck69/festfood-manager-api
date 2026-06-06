import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middlewares/authMiddleware";
import { handleScan } from "./scan.controller";

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message:
      "Too many scan requests from this IP, please try again after a minute.",
    errorSources: [],
  },
});

const router = Router();

router.post("/", scanLimiter, requireAuth, handleScan);

export const scanRoutes = router;
