import os from "os";
import path from "path";
import { Request, Response } from "express";
import { z } from "zod";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";
import { streamFileToResponse } from "../../shared/utils";
import {
  uploadAttendeesFromCsv,
  getAttendeesList,
  processManualOverride,
  wipeAllAttendees,
  getAttendeeFilterOptions,
  prepareAllTicketsBackup,
  generatePdfTicketsForIds,
  generateAllPdfTicketsBackup,
} from "./services/attendee.service";
import {
  updateLogisticsInventory,
  resetEventInventory,
} from "./services/logistics.service";
import {
  registerVolunteerAccount,
  getVolunteersList,
  removeVolunteer,
  wipeAllVolunteers,
} from "./services/volunteer.service";
import { getSystemLogs, getLogFilterOptions } from "./services/logs.service";
import {
  getAttendeesQuerySchema,
  getLogsQuerySchema,
  overrideBodySchema,
  inventoryBodySchema,
} from "./admin.schema";
import { ScanStatus } from "../../../prisma/generated/client";
import { sendAttendeeTicketEmail } from "./services/email.service";
import {
  getEmailProgressStats,
  startBackgroundEmailBatch,
} from "./services/emailWorker.service";
import { prisma } from "../../lib";

export const handleCsvUpload = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) throw new AppError(400, "No CSV file uploaded.");

    const result = await uploadAttendeesFromCsv(req.file.buffer);
    res.status(200).json({ success: true, data: result });
  },
);

export const handleGenerateTickets = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { type, attendeeIds } = req.body;
    let tempFilePath = "";

    if (type === "RECENT") {
      if (
        !attendeeIds ||
        !Array.isArray(attendeeIds) ||
        attendeeIds.length === 0
      ) {
        throw new AppError(
          400,
          "No valid attendee IDs provided for recent generation.",
        );
      }
      tempFilePath = await generatePdfTicketsForIds(attendeeIds);
    } else if (type === "ALL") {
      tempFilePath = await generateAllPdfTicketsBackup();
    } else {
      throw new AppError(
        400,
        "Invalid generation type. Must be RECENT or ALL.",
      );
    }

    const fileName = path.basename(tempFilePath);
    res.status(200).json({ success: true, data: { fileName } });
  },
);

export const downloadTempPdf = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filename = req.params.filename as string;

    const SAFE_FILENAME = /^tickets_[\w-]+\.pdf$/;
    if (!SAFE_FILENAME.test(filename)) {
      throw new AppError(400, "Invalid filename.");
    }

    const filePath = path.join(os.tmpdir(), filename);
    streamFileToResponse(res, filePath, filename);
  },
);

export const handleUpdateInventory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { totalAvailable } = inventoryBodySchema.parse(req.body);
    await updateLogisticsInventory(totalAvailable);

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
    });
  },
);

export const handleGetAttendees = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = getAttendeesQuerySchema.parse(req.query);
    let mappedStatus: "CLAIMED" | "UNCLAIMED" | undefined = undefined;
    if (filters.status === "CLAIMED") mappedStatus = "CLAIMED";
    else if (filters.status === "PENDING") mappedStatus = "UNCLAIMED";

    const result = await getAttendeesList(filters.page, filters.limit, {
      ...filters,
      status: mappedStatus,
    });

    res.status(200).json(result);
  },
);

export const handleManualOverride = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { attendeeId } = overrideBodySchema.parse(req.body);

    if (!req.user) throw new AppError(401, "Unauthorized.");

    const result = await processManualOverride(attendeeId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Manual override successful. Food marked as claimed.",
      data: result,
    });
  },
);

export const handleGetLogs = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = getLogsQuerySchema.parse(req.query);

    const status =
      filters.status === "ALL" ? undefined : (filters.status as ScanStatus);

    const result = await getSystemLogs(filters.page, filters.limit, {
      search: filters.search,
      status,
      segment: filters.segment,
      volunteerEmail: filters.volunteerEmail,
    });

    res.status(200).json(result);
  },
);

export const resetDatabase = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await wipeAllAttendees();
    res.status(200).json({ success: true, ...result });
  },
);

export const resetLogistics = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    await resetEventInventory();
    res.status(200).json({ success: true, message: "Event logistics reset." });
  },
);

export const getVolunteers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const volunteers = await getVolunteersList();
    res.status(200).json({ success: true, data: volunteers });
  },
);

export const deleteVolunteerController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1, "Invalid ID").parse(req.params.id);

    await removeVolunteer(id);

    res.status(200).json({ success: true, message: "Volunteer removed." });
  },
);

export const wipeVolunteersController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    await wipeAllVolunteers();
    res.status(200).json({
      success: true,
      message:
        "All volunteers and their scan logs have been permanently deleted.",
    });
  },
);

const createVolunteerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const createVolunteer = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = createVolunteerSchema.parse(req.body);
    const newUser = await registerVolunteerAccount(name, email, password);

    res.status(201).json({
      success: true,
      message: "Volunteer registered successfully.",
      data: newUser,
    });
  },
);

export const handleGetAttendeeFilters = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filterOptions = await getAttendeeFilterOptions();
    res.status(200).json({ success: true, data: filterOptions });
  },
);

export const handleGetLogFilters = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filterOptions = await getLogFilterOptions();
    res.status(200).json({ success: true, data: filterOptions });
  },
);

export const handleSendSingleEmail = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) throw new AppError(400, "Attendee ID is required");

    await sendAttendeeTicketEmail(id as string);

    await prisma.attendee.update({
      where: { id: id as string },
      data: { emailStatus: "SENT" },
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully.`,
    });
  },
);

export const handleStartEmailBatch = catchAsync(
  async (req: Request, res: Response) => {
    startBackgroundEmailBatch();

    res.status(202).json({
      success: true,
      message: "Background email batch started successfully.",
    });
  },
);

export const handleGetEmailProgress = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await getEmailProgressStats();
    res.status(200).json({ success: true, data: stats });
  },
);
