import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { generatePdfTicketsForIds } from "../admin/services/attendee.service";
import { streamFileToResponse } from "../../shared/utils/streamFile";

export const downloadAttendeeTicket = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any;

    if (!id) {
      throw new AppError(400, "Ticket ID is required.");
    }

    const attendee = await prisma.attendee.findUnique({
      where: { id },
    });

    if (!attendee) {
      throw new AppError(404, "Ticket not found or invalid link.");
    }

    const tempFilePath = await generatePdfTicketsForIds([id]);

    const sanitizedName = attendee.name.replace(/\s+/g, "_");
    const fileName = `FoodPass_${attendee.studentId}_${sanitizedName}.pdf`;

    streamFileToResponse(res, tempFilePath, fileName);
  },
);
