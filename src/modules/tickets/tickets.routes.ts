import { Router } from "express";
import { downloadAttendeeTicket } from "./tickets.controller";

const router = Router();

router.get("/:id/download", downloadAttendeeTicket);

export const ticketRoutes = router;
