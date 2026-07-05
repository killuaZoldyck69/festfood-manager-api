This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
assets/banner.png
assets/dept-logo.png
assets/footer-banner.png
assets/header-banner.png
assets/logo.png
assets/robot-mascot.png
assets/speech-bubble.png
package.json
prisma.config.ts
prisma/migrations/20260507194011_init_festfood_schema/migration.sql
prisma/migrations/20260507202017_add_better_auth_schema/migration.sql
prisma/migrations/20260510170733_added_attendee_email/migration.sql
prisma/migrations/20260524094433_add_student_id/migration.sql
prisma/migrations/20260530134715_add_semester_and_section/migration.sql
prisma/migrations/20260606214519_add_soft_delete_and_move_generated/migration.sql
prisma/migrations/20260612222540_add_phone_and_department/migration.sql
prisma/migrations/20260625195702_add_email_status/migration.sql
prisma/migrations/20260705082052_rename_attendee_fields/migration.sql
prisma/migrations/20260705093103_remove_attendee_email_unique/migration.sql
prisma/migrations/migration_lock.toml
prisma/schema.prisma
src/app.ts
src/errors/AppError.ts
src/errors/formatters/handlePrismaError.ts
src/errors/formatters/handleZodError.ts
src/errors/index.ts
src/lib/auth.ts
src/lib/index.ts
src/lib/prisma.ts
src/middlewares/adminMiddleware.ts
src/middlewares/authMiddleware.ts
src/middlewares/globalErrorHandler.ts
src/middlewares/index.ts
src/middlewares/notFoundHandler.ts
src/modules/admin/admin.controller.ts
src/modules/admin/admin.routes.ts
src/modules/admin/admin.schema.ts
src/modules/admin/index.ts
src/modules/admin/services/attendee.service.ts
src/modules/admin/services/email.service.ts
src/modules/admin/services/emailWorker.service.ts
src/modules/admin/services/logistics.service.ts
src/modules/admin/services/logs.service.ts
src/modules/admin/services/volunteer.service.ts
src/modules/admin/types/attendee.types.ts
src/modules/admin/types/csv.types.ts
src/modules/admin/types/index.ts
src/modules/admin/types/log.types.ts
src/modules/admin/types/volunteer.types.ts
src/modules/inventory/index.ts
src/modules/inventory/inventory.controller.ts
src/modules/inventory/inventory.routes.ts
src/modules/inventory/inventory.service.ts
src/modules/inventory/inventory.types.ts
src/modules/scan/index.ts
src/modules/scan/scan.controller.ts
src/modules/scan/scan.routes.ts
src/modules/scan/scan.schema.ts
src/modules/scan/scan.service.ts
src/modules/scan/scan.types.ts
src/modules/tickets/tickets.controller.ts
src/modules/tickets/tickets.routes.ts
src/modules/volunteer/index.ts
src/modules/volunteer/volunteer.controller.ts
src/modules/volunteer/volunteer.routes.ts
src/modules/volunteer/volunteer.schema.ts
src/modules/volunteer/volunteer.service.ts
src/modules/volunteer/volunteer.types.ts
src/server.ts
src/shared/catchAsync.ts
src/shared/config/env.ts
src/shared/logger.ts
src/shared/utils/index.ts
src/shared/utils/inventory.ts
src/shared/utils/pdfGenerator.ts
src/shared/utils/streamFile.ts
src/types/error.interface.ts
src/types/express.d.ts
src/types/index.ts
src/types/pagination.types.ts
tests/fixtures/duplicate-emails.csv
tests/fixtures/invalid-email.csv
tests/fixtures/missing-fields.csv
tests/fixtures/valid-attendees.csv
tests/integration/admin.routes.test.ts
tests/integration/app.test.ts
tests/integration/inventory.routes.test.ts
tests/integration/scan.routes.test.ts
tests/setup.ts
tests/unit/attendee.service.test.ts
tests/unit/errors.test.ts
tests/unit/inventory.service.test.ts
tests/unit/logs.service.test.ts
tests/unit/middlewares.test.ts
tests/unit/pdfGenerator.test.ts
tests/unit/scan.service.test.ts
tests/unit/streamFile.test.ts
tests/unit/volunteer.service.test.ts
tsconfig.json
vitest.config.ts
```

# Files

## File: prisma/migrations/20260705082052_rename_attendee_fields/migration.sql
```sql
/*
  Warnings:

  - You are about to drop the column `category` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Attendee` table. All the data in the column will be lost.
  - Added the required column `phone` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segment` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" DROP COLUMN "category",
DROP COLUMN "phoneNumber",
DROP COLUMN "section",
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "segment" TEXT NOT NULL,
ADD COLUMN     "team" TEXT NOT NULL;
```

## File: prisma/migrations/20260705093103_remove_attendee_email_unique/migration.sql
```sql
-- DropIndex
DROP INDEX "Attendee_email_key";
```

## File: prisma/migrations/20260507194011_init_festfood_schema/migration.sql
```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('SUCCESS', 'DUPLICATE', 'INVALID', 'MANUAL_OVERRIDE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "foodClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "attendeeId" TEXT,
    "scannedToken" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLogistics" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalAvailable" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLogistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_qrToken_key" ON "Attendee"("qrToken");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## File: prisma/migrations/20260507202017_add_better_auth_schema/migration.sql
```sql
/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScanLog" DROP CONSTRAINT "ScanLog_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idToken" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## File: prisma/migrations/20260510170733_added_attendee_email/migration.sql
```sql
/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");
```

## File: prisma/migrations/20260524094433_add_student_id/migration.sql
```sql
/*
  Warnings:

  - Added the required column `studentId` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "studentId" TEXT NOT NULL;
```

## File: prisma/migrations/20260530134715_add_semester_and_section/migration.sql
```sql
/*
  Warnings:

  - Added the required column `section` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "section" TEXT NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL;
```

## File: prisma/migrations/20260606214519_add_soft_delete_and_move_generated/migration.sql
```sql
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletedAt" TIMESTAMP(3);
```

## File: prisma/migrations/20260612222540_add_phone_and_department/migration.sql
```sql
/*
  Warnings:

  - Added the required column `department` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
```

## File: prisma/migrations/20260625195702_add_email_status/migration.sql
```sql
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "emailStatus" TEXT NOT NULL DEFAULT 'PENDING';
```

## File: prisma/migrations/migration_lock.toml
```toml
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
```

## File: src/errors/AppError.ts
```typescript
export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

## File: src/errors/formatters/handleZodError.ts
```typescript
import { ZodError } from "zod";
import { TGenericErrorResponse } from "../../types/error.interface";

export const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources = err.issues.map((issue) => ({
    path: (issue.path[issue.path.length - 1] as string | number) || "",
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
};
```

## File: src/errors/index.ts
```typescript
export * from "./AppError";
export * from "./formatters/handlePrismaError";
export * from "./formatters/handleZodError";
```

## File: src/lib/index.ts
```typescript
export * from "./prisma";
export * from "./auth";
```

## File: src/middlewares/index.ts
```typescript
export * from "./globalErrorHandler";
export * from "./authMiddleware";
export * from "./adminMiddleware";
export * from "./notFoundHandler";
```

## File: src/modules/admin/index.ts
```typescript
export * from "./types";
export * from "./admin.schema";
export * from "./services/attendee.service";
export * from "./services/logistics.service";
export * from "./services/logs.service";
export * from "./services/volunteer.service";
export * from "./admin.controller";
export * from "./admin.routes";
```

## File: src/modules/admin/services/logistics.service.ts
```typescript
import { prisma } from "../../../lib/prisma";

export const updateLogisticsInventory = async (
  totalAvailable: number,
): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable },
    create: { id: 1, totalAvailable },
  });
};

export const resetEventInventory = async (): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable: 0 },
    create: { id: 1, totalAvailable: 0 },
  });
};
```

## File: src/modules/admin/types/index.ts
```typescript
export * from "./csv.types";
export * from "./attendee.types";
export * from "./log.types";
export * from "./volunteer.types";
```

## File: src/modules/inventory/index.ts
```typescript
export * from "./inventory.types";
export * from "./inventory.service";
export * from "./inventory.controller";
export * from "./inventory.routes";
```

## File: src/modules/inventory/inventory.types.ts
```typescript
export interface InventoryStats {
  totalAvailable: number;
  totalServed: number;
  totalParticipants: number;
  duplicateScans: number;
  invalidTickets: number;
  percentageClaimed: number;
}

export interface SystemHealth {
  database: {
    status: "up" | "down";
    latencyMs: number;
  };
  memory: {
    heapUsedMB: number;
  };
  uptime: number;
  version: string;
}
```

## File: src/modules/scan/index.ts
```typescript
export * from "./scan.types";
export * from "./scan.schema";
export * from "./scan.service";
export * from "./scan.controller";
export * from "./scan.routes";
```

## File: src/modules/tickets/tickets.controller.ts
```typescript
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
```

## File: src/modules/tickets/tickets.routes.ts
```typescript
import { Router } from "express";
import { downloadAttendeeTicket } from "./tickets.controller";

const router = Router();

router.get("/:id/download", downloadAttendeeTicket);

export const ticketRoutes = router;
```

## File: src/modules/volunteer/index.ts
```typescript
export * from "./volunteer.types";
export * from "./volunteer.schema";
export * from "./volunteer.service";
export * from "./volunteer.controller";
export * from "./volunteer.routes";
```

## File: src/shared/logger.ts
```typescript
import pino from "pino";
import { envConfig } from "./config/env";

export const logger = pino({
  level: envConfig.NODE_ENV === "production" ? "info" : "debug",
  transport:
    envConfig.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});
```

## File: src/shared/utils/index.ts
```typescript
export * from "./inventory";
export * from "./streamFile";
export * from "./pdfGenerator";
```

## File: src/shared/utils/inventory.ts
```typescript
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

export const assertInventoryAvailable = async (): Promise<void> => {
  const logistics = await prisma.eventLogistics.findUnique({
    where: { id: 1 },
  });

  if (!logistics) {
    throw new AppError(400, "Event logistics not initialized.");
  }

  if (logistics.totalAvailable <= 0) {
    throw new AppError(400, "Inventory depleted. No food available.");
  }
};
```

## File: src/shared/utils/pdfGenerator.ts
```typescript
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export interface AttendeeTicketData {
  name: string;
  email: string;
  studentId: string;
  university: string;
  segment: string;
  semester: string;
  team: string;
  qrToken: string;
}

const TICKET = {
  WIDTH: 515,
  HEIGHT: 175,
  START_X: 40,
  START_Y_BASE: 40,
  SPACING: 15,
  INFO_WIDTH: 515 * 0.7,
  QR_WIDTH: 515 * 0.3,
} as const;

const COLORS = {
  BACKGROUND_DARK: "#0f172a",
  TEXT_WHITE: "#ffffff",
  TEXT_LIGHT_GRAY: "#cbd5e1",
  TEXT_MUTED: "#94a3b8",
  TEXT_OFF_WHITE: "#f8fafc",
  BADGE_BG: "#ea580c",
  STROKE_DARK: "#1e293b",
} as const;

const loadAsset = (filePath: string): Buffer | null => {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
};

const drawBackground = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  bannerBuffer: Buffer | null,
): void => {
  if (bannerBuffer) {
    doc.image(bannerBuffer, TICKET.START_X, currentY, {
      width: TICKET.INFO_WIDTH,
      height: TICKET.HEIGHT,
    });
    doc
      .rect(TICKET.START_X, currentY, TICKET.INFO_WIDTH, TICKET.HEIGHT)
      .fillOpacity(0.85)
      .fill(COLORS.BACKGROUND_DARK);
    doc.fillOpacity(1);
  } else {
    doc
      .rect(TICKET.START_X, currentY, TICKET.INFO_WIDTH, TICKET.HEIGHT)
      .fill(COLORS.BACKGROUND_DARK);
  }
};

const drawHeader = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  deptLogoBuffer: Buffer | null,
): void => {
  const titleText = "SMUCT CSE FEST V3";
  const subtitleText = "Organized by Department of CSE and CSIT.";
  const logoSize = 42;
  const gap = 14;
  const headerStartX = TICKET.START_X + 15;
  const textStartX = deptLogoBuffer
    ? headerStartX + logoSize + gap
    : headerStartX;

  if (deptLogoBuffer) {
    doc.image(deptLogoBuffer, headerStartX, currentY + 12, {
      width: logoSize,
    });
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor(COLORS.TEXT_WHITE)
    .text(titleText, textStartX, currentY + 18);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(COLORS.TEXT_LIGHT_GRAY)
    .text(subtitleText, textStartX, currentY + 38);
};

const drawBadge = (doc: PDFKit.PDFDocument, currentY: number): void => {
  doc.rect(TICKET.START_X + 15, currentY + 62, 80, 18).fill(COLORS.BADGE_BG);
  doc
    .fillColor(COLORS.TEXT_WHITE)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("FOOD PASS", TICKET.START_X + 15, currentY + 67, {
      width: 80,
      align: "center",
      characterSpacing: 1,
    });
};

const drawDetails = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  attendee: AttendeeTicketData,
): void => {
  const detailsY = currentY + 86;
  const labelX = TICKET.START_X + 15;
  const valueX = TICKET.START_X + 80;
  const maxTextWidth = TICKET.INFO_WIDTH - 95;

  const drawRow = (
    label: string,
    value: string,
    yOffset: number,
    isName = false,
  ): void => {
    doc
      .fontSize(9)
      .fillColor(COLORS.TEXT_MUTED)
      .font("Helvetica")
      .text(label, labelX, detailsY + yOffset);

    doc
      .fontSize(isName ? 10 : 9)
      .fillColor(isName ? COLORS.TEXT_WHITE : COLORS.TEXT_OFF_WHITE)
      .font("Helvetica-Bold")
      .text(value, valueX, detailsY + yOffset - (isName ? 0.5 : 0), {
        width: maxTextWidth,
        lineBreak: false,
        ellipsis: true,
      });
  };

  const semSecString = `${attendee.semester || "N/A"} / ${attendee.team || "N/A"}`;

  drawRow("Name:", attendee.name, 0, true);
  drawRow("ID:", attendee.studentId, 14);
  drawRow("Sem/Sec:", semSecString, 28);
  drawRow("Email:", attendee.email, 42);
  drawRow("University:", attendee.university, 56);
  drawRow("Segment:", attendee.segment, 70);
};

const drawQrSection = async (
  doc: PDFKit.PDFDocument,
  currentY: number,
  attendee: AttendeeTicketData,
  qrLogoBuffer: Buffer | null,
): Promise<void> => {
  doc
    .rect(
      TICKET.START_X + TICKET.INFO_WIDTH,
      currentY,
      TICKET.QR_WIDTH,
      TICKET.HEIGHT,
    )
    .fillAndStroke(COLORS.TEXT_WHITE, COLORS.STROKE_DARK);

  doc
    .fillColor(COLORS.STROKE_DARK)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("SCAN FOR FOOD", TICKET.START_X + TICKET.INFO_WIDTH, currentY + 15, {
      width: TICKET.QR_WIDTH,
      align: "center",
    });

  const qrImage = await QRCode.toBuffer(attendee.qrToken, {
    errorCorrectionLevel: "H",
    margin: 1,
  });

  const qrSize = 100;
  const qrX =
    TICKET.START_X + TICKET.INFO_WIDTH + TICKET.QR_WIDTH / 2 - qrSize / 2;
  const qrY = currentY + 35;

  doc.image(qrImage, qrX, qrY, { width: qrSize });

  if (qrLogoBuffer) {
    const logoSize = 24;
    const logoX = qrX + qrSize / 2 - logoSize / 2;
    const logoY = qrY + qrSize / 2 - logoSize / 2;
    doc
      .rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
      .fill(COLORS.TEXT_WHITE);
    doc.image(qrLogoBuffer, logoX, logoY, { width: logoSize });
  }

  doc
    .fontSize(7)
    .font("Helvetica-Oblique")
    .fillColor(COLORS.TEXT_MUTED)
    .text(
      "Developed by Shishimaru",
      TICKET.START_X + TICKET.INFO_WIDTH,
      currentY + TICKET.HEIGHT - 15,
      { width: TICKET.QR_WIDTH, align: "center" },
    );

  doc
    .rect(TICKET.START_X, currentY, TICKET.WIDTH, TICKET.HEIGHT)
    .lineWidth(1.5)
    .strokeColor(COLORS.STROKE_DARK)
    .stroke();
};

export const buildPdfTicketsToDisk = async (
  attendees: AttendeeTicketData[],
): Promise<string> => {
  const qrLogoPath = path.resolve(process.cwd(), "assets/logo.png");
  const deptLogoPath = path.resolve(process.cwd(), "assets/dept-logo.png");
  const bannerPath = path.resolve(process.cwd(), "assets/banner.png");

  const qrLogoBuffer = loadAsset(qrLogoPath);
  const deptLogoBuffer = loadAsset(deptLogoPath);
  const bannerBuffer = loadAsset(bannerPath);

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const tempFilePath = path.join(os.tmpdir(), `tickets_${uuidv4()}.pdf`);
  const writeStream = fs.createWriteStream(tempFilePath);

  doc.pipe(writeStream);

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    if (i > 0 && i % 4 === 0) doc.addPage();

    const currentY =
      TICKET.START_Y_BASE + (i % 4) * (TICKET.HEIGHT + TICKET.SPACING);

    drawBackground(doc, currentY, bannerBuffer);
    drawHeader(doc, currentY, deptLogoBuffer);
    drawBadge(doc, currentY);
    drawDetails(doc, currentY, attendee);
    await drawQrSection(doc, currentY, attendee, qrLogoBuffer);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(tempFilePath));
    writeStream.on("error", reject);
  });
};
```

## File: src/types/error.interface.ts
```typescript
export type TErrorSources = {
  path: string | number;
  message: string;
}[];

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};
```

## File: src/types/index.ts
```typescript
export * from "./error.interface";
export * from "./pagination.types";
export * from "./express.d";
```

## File: src/types/pagination.types.ts
```typescript
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

## File: tests/fixtures/duplicate-emails.csv
```
name,email,studentId,university,role,segment,semester,team
User One,duplicate@example.com,S001,Uni A,Student,Hackathon,Fall 2026,A
User Two,duplicate@example.com,S002,Uni B,Student,Datathon,Spring 2026,B
User Three,user3@example.com,S003,Uni A,Faculty,General,Fall 2026,C
```

## File: tests/fixtures/invalid-email.csv
```
name,email,studentId,university,role,segment,semester,team
User One,user1@example.com,S001,Uni A,Member,Hackathon,Fall 2026,A
User Two,not-an-email-address,S002,Uni B,Leader,Datathon,Fall 2026,B
User Three,user3@example.com,S003,Uni A,Member,General,Fall 2026,C
```

## File: tests/fixtures/missing-fields.csv
```
name,email,studentId,university,role,segment,semester,team
User One,user1@example.com,S001,Uni A,Student,Hackathon,Fall 2026,A
User Two,user2@example.com,S002,Uni B,Student,Datathon,,B
User Three,user3@example.com,S003,Uni A,Faculty,General,Fall 2026,C
```

## File: tests/fixtures/valid-attendees.csv
```
name,email,studentId,university,role,segment,semester,team
John Doe,john@example.com,S001,Test Uni,Student,Hackathon,Fall 2026,A
Jane Smith,jane@example.com,S002,Test Uni,Student,Datathon,Fall 2026,B
Alice Jones,alice@example.com,S003,Test Uni,Faculty,General,Fall 2026,C
Bob Brown,bob@example.com,S004,Other Uni,Student,Hackathon,Spring 2026,A
Charlie Day,charlie@example.com,S005,Other Uni,External,General,Spring 2026,B
```

## File: tests/integration/admin.routes.test.ts
```typescript
import request from "supertest";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { Request, Response } from "express";
import { DeepMockProxy } from "vitest-mock-extended";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { requireAdmin } from "../../src/middlewares/adminMiddleware";
import * as volunteerService from "../../src/modules/admin/services/volunteer.service";
import { PrismaClient } from "@prisma/client/extension";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Integration: Admin Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Security & Authorization", () => {
    it("returns 403 Forbidden if user is not an ADMIN", async () => {
      (requireAdmin as Mock).mockImplementationOnce(
        (req: Request, res: Response) => {
          return res.status(403).json({ message: "Forbidden: Admins only" });
        },
      );

      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: 1000 });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/v1/admin/inventory", () => {
    it("successfully updates the global inventory logistics", async () => {
      prismaMock.eventLogistics.upsert.mockResolvedValue({
        id: 1,
        totalAvailable: 1500,
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: 1500 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Inventory updated successfully.");
      expect(prismaMock.eventLogistics.upsert).toHaveBeenCalledTimes(1);
    });

    it("returns 400 if totalAvailable is missing or invalid", async () => {
      const response = await request(app)
        .put("/api/v1/admin/inventory")
        .send({ totalAvailable: -50 });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/admin/override", () => {
    const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("successfully bypasses standard scan logic to mark food as claimed", async () => {
      prismaMock.attendee.findUnique.mockResolvedValue({
        id: fakeUuid,
        name: "Test Override User",
        email: "override@test.com",
        studentId: "001",
        university: "Test",
        role: "Student",
        segment: "General",
        semester: "Fall",
        team: "A",
        qrToken: "manual-token",
        foodClaimed: false,
        claimedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.eventLogistics.findUnique.mockResolvedValue({
        id: 1,
        totalAvailable: 50,
        updatedAt: new Date(),
      });

      prismaMock.attendee.count.mockResolvedValue(0);

      prismaMock.$transaction.mockResolvedValue([
        { id: fakeUuid, foodClaimed: true },
        { id: "log-1" },
      ]);

      const response = await request(app)
        .post("/api/v1/admin/override")
        .send({ attendeeId: fakeUuid });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Manual override successful");
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/v1/admin/volunteers", () => {
    it("successfully creates a new volunteer account", async () => {
      // 💥 Added createdAt back to satisfy the strict DTO requirements
      vi.spyOn(volunteerService, "registerVolunteerAccount").mockResolvedValue({
        id: "new-volunteer-id",
        name: "New Volunteer",
        email: "volunteer@fest.com",
        role: "VOLUNTEER",
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/v1/admin/volunteers")
        .send({
          name: "New Volunteer",
          email: "volunteer@fest.com",
          password: "SecurePassword123!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Volunteer registered successfully.");
      expect(volunteerService.registerVolunteerAccount).toHaveBeenCalledTimes(
        1,
      );
    });

    it("returns 400 if validation fails (e.g., weak password or bad email)", async () => {
      const response = await request(app)
        .post("/api/v1/admin/volunteers")
        .send({
          name: "",
          email: "not-an-email",
          password: "short",
        });

      expect(response.status).toBe(400);
    });
  });
});
```

## File: tests/integration/app.test.ts
```typescript
import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/app";

describe("Integration: Global App Configuration & Error Handling", () => {
  describe("404 Not Found Handler", () => {
    it("returns a structured 404 JSON response for completely unknown routes", async () => {
      const response = await request(app).get(
        "/api/v1/this-route-definitely-does-not-exist",
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/does not exist/i);
    });
  });

  describe("Global Error Handler", () => {
    it("gracefully catches syntax errors (like malformed JSON) without crashing", async () => {
      const response = await request(app)
        .post("/api/v1/scan")
        .set("Content-Type", "application/json")
        .send("{ completely malformed json syntax ]");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });
});
```

## File: tests/integration/inventory.routes.test.ts
```typescript
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepMockProxy } from "vitest-mock-extended";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { PrismaClient } from "../../prisma/generated/client";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Integration: Inventory Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/inventory", () => {
    it("returns 200 and calculates live inventory statistics", async () => {
      // Mock the 5 parallel database queries from the service
      prismaMock.eventLogistics.findUnique.mockResolvedValue({
        id: 1,
        totalAvailable: 500,
        updatedAt: new Date(),
      });
      prismaMock.attendee.count.mockResolvedValueOnce(150); // totalServed
      prismaMock.scanLog.count.mockResolvedValueOnce(10); // duplicateScans
      prismaMock.scanLog.count.mockResolvedValueOnce(5); // invalidTickets
      prismaMock.attendee.count.mockResolvedValueOnce(1000); // totalParticipants

      const response = await request(app).get("/api/v1/inventory");

      expect(response.status).toBe(200);
      expect(response.body.totalAvailable).toBe(500);
      expect(response.body.totalServed).toBe(150);
      expect(response.body.totalParticipants).toBe(1000);
      expect(response.body.duplicateScans).toBe(10);
      expect(response.body.invalidTickets).toBe(5);
      expect(response.body.percentageClaimed).toBe(30); // (150 / 500) * 100
    });
  });

  describe("GET /api/v1/inventory/health", () => {
    it("returns 200 and 'up' status if the database is connected", async () => {
      prismaMock.$queryRaw.mockResolvedValue([1]);

      const response = await request(app).get("/api/v1/inventory/health");

      expect(response.status).toBe(200);
      expect(response.body.database.status).toBe("up");
      expect(response.body.uptime).toBeDefined();
    });

    it("returns 503 and 'down' status if the database query fails", async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error("Connection refused"));

      const response = await request(app).get("/api/v1/inventory/health");

      expect(response.status).toBe(503);
      expect(response.body.database.status).toBe("down");
    });
  });
});
```

## File: tests/integration/scan.routes.test.ts
```typescript
import request from "supertest";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { requireAuth } from "../../src/middlewares/authMiddleware";
import { Request, Response } from "express";

const prismaMock = prisma as any;

describe("Integration: POST /api/v1/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without auth token", async () => {
    (requireAuth as Mock).mockImplementationOnce(
      (req: Request, res: Response) => {
        return res.status(401).json({ message: "Unauthorized" });
      },
    );

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "123" });

    expect(response.status).toBe(401);
  });

  it("returns 400 with missing qrToken", async () => {
    const response = await request(app).post("/api/v1/scan").send({});
    expect(response.status).toBe(400);
  });

  it("returns 404 with unknown token", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    prismaMock.scanLog.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "unknown-token" });

    expect(response.status).toBe(404);
  });

  it("returns 200 with valid token", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 10,
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}, {}]);

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "valid-token" });

    expect(response.status).toBe(200);
  });

  it("returns 409 on duplicate scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    prismaMock.scanLog.create.mockResolvedValue({});

    const response = await request(app)
      .post("/api/v1/scan")
      .send({ qrToken: "used-token" });

    expect(response.status).toBe(409);
  });
});
```

## File: tests/setup.ts
```typescript
import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "../prisma/generated/client";
import { prisma } from "../src/lib/prisma";

// 1. Tell Vitest to mock the prisma library
vi.mock("../src/lib/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// 2. Reset the mock before every single test so data doesn't leak
beforeEach(() => {
  mockReset(prisma);
});

// 3. Mock the Better-Auth middleware so we can bypass authentication in tests
vi.mock("../src/middlewares/authMiddleware", () => ({
  requireAuth: vi.fn((req, res, next) => {
    req.user = { id: "test-volunteer-id", role: "VOLUNTEER" };
    next();
  }),
}));

vi.mock("../src/middlewares/adminMiddleware", () => ({
  requireAdmin: vi.fn((req, res, next) => {
    req.user = { id: "test-admin-id", role: "ADMIN" };
    next();
  }),
}));
```

## File: tests/unit/attendee.service.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { uploadAttendeesFromCsv } from "../../src/modules/admin/services/attendee.service";
import { prisma } from "../../src/lib/prisma";
import { AppError } from "../../src/errors/AppError";

const prismaMock = prisma as any;

// Mock the PDF generator so we don't try to actually write PDFs during tests
vi.mock("../../src/shared/utils/pdfGenerator", () => ({
  buildPdfTicketsToDisk: vi.fn().mockResolvedValue("/tmp/mock-tickets.pdf"),
}));

describe("Unit: Attendee Service (CSV Upload)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.attendee.findMany.mockResolvedValue([]);
    prismaMock.attendee.createMany.mockResolvedValue({ count: 0 });
  });

  it("rejects CSV row with missing required field", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/missing-fields.csv"),
    );
    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(AppError);
  });

  it("rejects CSV row with whitespace-only field", async () => {
    const csvWithWhitespace = `name,email,studentId,university,role,segment,semester,team
John Doe,john@example.com,S001,Uni,Student,Cat, ,A`; // Semester is just space
    await expect(
      uploadAttendeesFromCsv(Buffer.from(csvWithWhitespace)),
    ).rejects.toThrow(AppError);
  });

  it("rejects CSV row with invalid email format", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/invalid-email.csv"),
    );
    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(
      /invalid email/i,
    );
  });

  it("skips existing emails and returns correct insertedCount", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );
    // Mock that the first 2 users already exist in the database
    prismaMock.attendee.findMany.mockResolvedValue([
      { email: "john@example.com" },
      { email: "jane@example.com" },
    ]);

    const result = await uploadAttendeesFromCsv(buffer);
    // 5 total in CSV - 2 existing = 3 inserted
    expect(result.insertedCount).toBe(3);
  });

  it("throws 409 when all rows already exist in database", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );
    // Mock that ALL users already exist
    prismaMock.attendee.findMany.mockResolvedValue([
      { email: "john@example.com" },
      { email: "jane@example.com" },
      { email: "alice@example.com" },
      { email: "bob@example.com" },
      { email: "charlie@example.com" },
    ]);

    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(
      /already in the system/,
    );
  });

  it("correctly inserts new attendees and generates qrToken per row", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );

    await uploadAttendeesFromCsv(buffer);

    expect(prismaMock.attendee.createMany).toHaveBeenCalled();
    const createData = prismaMock.attendee.createMany.mock.calls[0][0].data;
    expect(createData).toHaveLength(5);
    expect(createData[0]).toHaveProperty("qrToken");
  });
});
```

## File: tests/unit/errors.test.ts
```typescript
import { describe, it, expect } from "vitest";
import { handlePrismaError } from "../../src/errors/formatters/handlePrismaError";
import { Prisma } from "../../prisma/generated/client";

describe("Unit: Prisma Error Formatter", () => {
  it("handles P2002 Unique Constraint errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Conflict", {
      code: "P2002",
      clientVersion: "5.0.0",
      meta: { target: ["email"] },
    });

    const appError = handlePrismaError(error);
    expect(appError.statusCode).toBe(409);
    expect(appError.message).toBe("Duplicate Entry");
  });

  it("handles P2025 Record Not Found errors", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "5.0.0",
      meta: { cause: "Record to update not found." },
    });

    const appError = handlePrismaError(error);
    expect(appError.statusCode).toBe(404);
    expect(appError.message).toBe("Record not found");
  });

  it("handles generic Prisma Initialization errors", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "Could not connect to DB",
      "5.0.0",
    );
    const appError = handlePrismaError(error as any);
    expect(appError.statusCode).toBe(400);
    expect(appError.message).toBe("Database Error");
  });

  it("handles generic Prisma Validation errors", () => {
    const error = new Prisma.PrismaClientValidationError("Invalid field", {
      clientVersion: "5.0.0",
    });
    const appError = handlePrismaError(error as any);
    expect(appError.statusCode).toBe(400);
    expect(appError.message).toBe("Database Error");
  });
});
```

## File: tests/unit/inventory.service.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getInventoryStats } from "../../src/modules/inventory/inventory.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Inventory Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct totalServed count", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 100,
    });
    prismaMock.attendee.count.mockResolvedValueOnce(25); // totalServed
    prismaMock.scanLog.count.mockResolvedValueOnce(0);
    prismaMock.scanLog.count.mockResolvedValueOnce(0);
    prismaMock.attendee.count.mockResolvedValueOnce(100);

    const stats = await getInventoryStats();
    expect(stats.totalServed).toBe(25);
  });

  it("returns correct totalAvailable from EventLogistics", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 75,
    });
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.totalAvailable).toBe(75);
  });

  it("returns 0 for totalAvailable when EventLogistics row is absent", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue(null);
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.totalAvailable).toBe(0);
  });

  it("returns correct percentageClaimed calculation", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 200,
    });
    prismaMock.attendee.count.mockResolvedValueOnce(50); // totalServed
    prismaMock.scanLog.count.mockResolvedValue(0);
    prismaMock.attendee.count.mockResolvedValueOnce(0);

    const stats = await getInventoryStats();
    expect(stats.percentageClaimed).toBe(25); // 50 / 200
  });

  it("handles zero totalAvailable without division by zero", async () => {
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 0,
    });
    prismaMock.attendee.count.mockResolvedValue(0);
    prismaMock.scanLog.count.mockResolvedValue(0);

    const stats = await getInventoryStats();
    expect(stats.percentageClaimed).toBe(0);
    expect(stats.totalAvailable).toBe(0);
  });
});
```

## File: tests/unit/logs.service.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSystemLogs,
  getLogFilterOptions,
} from "../../src/modules/admin/services/logs.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Logs Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSystemLogs", () => {
    it("fetches and maps paginated logs with search filters", async () => {
      prismaMock.scanLog.count.mockResolvedValue(1);
      prismaMock.scanLog.findMany.mockResolvedValue([
        {
          id: "log1",
          status: "SUCCESS",
          scannedToken: "123",
          scannedAt: new Date(),
          volunteer: { name: "V1" },
          attendee: { name: "A1" },
        },
      ]);

      const result = await getSystemLogs(1, 10, {
        status: "SUCCESS",
        search: "John",
      });

      expect(result.meta.total).toBe(1);
      expect(result.data[0].volunteerName).toBe("V1");
      // Verify search clause was built properly
      expect(prismaMock.scanLog.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "SUCCESS",
            attendee: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe("getLogFilterOptions", () => {
    it("aggregates and maps group categories and volunteers", async () => {
      // Mock Volunteer aggregations
      prismaMock.scanLog.groupBy.mockResolvedValueOnce([
        { volunteerId: "v1", _count: { id: 10 } },
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { id: "v1", name: "Vol Name", email: "v@test.com" },
      ]);

      // Mock Attendee aggregations
      prismaMock.scanLog.groupBy.mockResolvedValueOnce([
        { attendeeId: "a1", _count: { id: 5 } },
      ]);
      prismaMock.attendee.findMany.mockResolvedValue([
        { id: "a1", segment: "Hackathon" },
      ]);

      const result = await getLogFilterOptions();

      expect(result.volunteers).toHaveLength(1);
      expect(result.volunteers[0].name).toBe("Vol Name");
      expect(result.volunteers[0].count).toBe(10);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe("Hackathon");
      expect(result.categories[0].count).toBe(5);
    });
  });
});
```

## File: tests/unit/middlewares.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

// 💥 FIX: Explicitly unmock the middlewares to override tests/setup.ts!
vi.unmock("../../src/middlewares/authMiddleware");
vi.unmock("../../src/middlewares/adminMiddleware");

// 1. Mock Better Auth so it doesn't try to read from the database
vi.mock("../../src/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../../src/lib/auth";
import { requireAuth } from "../../src/middlewares/authMiddleware";
import { requireAdmin } from "../../src/middlewares/adminMiddleware";

describe("Unit: Middlewares", () => {
  const mockNext = vi.fn() as NextFunction;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("requireAuth", () => {
    it("returns 401 if session is missing", async () => {
      // Mock Better Auth to return no active session
      (auth.api.getSession as any).mockResolvedValue(null);

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() if session exists and attaches user to req", async () => {
      // Mock Better Auth to return a valid session
      (auth.api.getSession as any).mockResolvedValue({
        user: { id: "1", role: "VOLUNTEER" },
      });

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user.id).toBe("1");
    });
  });

  describe("requireAdmin", () => {
    it("returns 403 if user is not an ADMIN", () => {
      // Manually attach a VOLUNTEER user to the request
      mockRequest.user = { id: "1", role: "VOLUNTEER" } as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() if user is an ADMIN", () => {
      // Manually attach an ADMIN user to the request
      mockRequest.user = { id: "2", role: "ADMIN" } as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
```

## File: tests/unit/pdfGenerator.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildPdfTicketsToDisk,
  AttendeeTicketData,
} from "../../src/shared/utils/pdfGenerator";
import fs from "fs";
import os from "os";
import QRCode from "qrcode";
// Import the mocked library so we can track its calls in the tests
import PDFDocument from "pdfkit";

// 1. Mock external file system and QR libraries
vi.mock("fs");
vi.mock("os");
vi.mock("qrcode", () => ({
  default: { toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-qr")) },
}));

// 2. Deep mock PDFKit's chainable methods to execute the drawing code safely
vi.mock("pdfkit", () => {
  const mDoc = {
    pipe: vi.fn(),
    addPage: vi.fn(),
    rect: vi.fn().mockReturnThis(),
    fillOpacity: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    image: vi.fn().mockReturnThis(),
    fontSize: vi.fn().mockReturnThis(),
    font: vi.fn().mockReturnThis(),
    fillColor: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    fillAndStroke: vi.fn().mockReturnThis(),
    lineWidth: vi.fn().mockReturnThis(),
    strokeColor: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    end: vi.fn(),
  };

  // 💥 FIX: Use a standard function instead of an arrow function so it can be instantiated with `new`
  return {
    default: vi.fn().mockImplementation(function () {
      return mDoc;
    }),
  };
});

describe("Unit: PDF Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (os.tmpdir as any).mockReturnValue("/tmp");

    // Simulate that asset files (logos) DO exist so the background logic runs
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(Buffer.from("fake-image"));

    // Simulate the WriteStream finishing instantly so the promise resolves
    (fs.createWriteStream as any).mockReturnValue({
      on: vi.fn((event, cb) => {
        if (event === "finish") cb();
      }),
    });
  });

  const mockAttendee: AttendeeTicketData = {
    name: "John Doe",
    email: "john@example.com",
    studentId: "12345",
    university: "Test University",
    segment: "General",
    semester: "Fall 2026",
    team: "A",
    qrToken: "test-token-123",
  };

  it("generates a PDF for a single attendee", async () => {
    const filePath = await buildPdfTicketsToDisk([mockAttendee]);
    expect(filePath).toContain("tickets_");
    expect(fs.createWriteStream).toHaveBeenCalled();
  });

  it("adds a new page when generating more than 4 tickets", async () => {
    const attendees = Array(5).fill(mockAttendee); // 5 tickets = 2 pages
    await buildPdfTicketsToDisk(attendees);

    // 💥 FIX: Access the mock instance safely via the imported module
    const mockDocInstance = (PDFDocument as any).mock.results[0].value;
    expect(mockDocInstance.addPage).toHaveBeenCalledTimes(1);
  });

  it("handles missing assets gracefully (no logos found)", async () => {
    (fs.existsSync as any).mockReturnValue(false); // No logos!

    const filePath = await buildPdfTicketsToDisk([mockAttendee]);
    expect(filePath).toContain("tickets_");
  });
});
```

## File: tests/unit/scan.service.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { processScan } from "../../src/modules/scan/scan.service";
import { prisma } from "../../src/lib/prisma";

const prismaMock = prisma as any;

describe("Unit: Scan Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns INVALID when token does not exist in database", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    prismaMock.scanLog.create.mockResolvedValue({});

    const result = await processScan("fake-token", "vol-1");
    expect(result.status).toBe("INVALID");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("returns DUPLICATE when attendee.foodClaimed is true", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    prismaMock.scanLog.create.mockResolvedValue({});

    const result = await processScan("used-token", "vol-1");
    expect(result.status).toBe("DUPLICATE");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("returns DEPLETED when inventory is zero", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 0,
    });

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("DEPLETED");
  });

  it("returns DEPLETED when EventLogistics row does not exist", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue(null);

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("DEPLETED");
  });

  it("returns SUCCESS and decrements inventory by 1, updating attendee foodClaimed", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: false,
    });
    prismaMock.eventLogistics.findUnique.mockResolvedValue({
      totalAvailable: 50,
    });
    prismaMock.$transaction.mockResolvedValue([
      { id: "1", foodClaimed: true },
      {},
      { count: 1 },
    ]);

    const result = await processScan("valid-token", "vol-1");
    expect(result.status).toBe("SUCCESS");
    expect(prismaMock.$transaction).toHaveBeenCalled();

    const transactionArgs = prismaMock.$transaction.mock.calls[0][0];
    expect(transactionArgs).toHaveLength(3);
  });

  it("creates ScanLog entry for every scan regardless of outcome", async () => {
    // Test INVALID path
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    await processScan("fake", "vol-1");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();

    // Test DUPLICATE path
    vi.clearAllMocks();
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    await processScan("used", "vol-1");
    expect(prismaMock.scanLog.create).toHaveBeenCalled();
  });

  it("does not decrement inventory on INVALID scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue(null);
    await processScan("fake-token", "vol-1");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.eventLogistics.updateMany).not.toHaveBeenCalled();
  });

  it("does not decrement inventory on DUPLICATE scan", async () => {
    prismaMock.attendee.findUnique.mockResolvedValue({
      id: "1",
      foodClaimed: true,
    });
    await processScan("used-token", "vol-1");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.eventLogistics.updateMany).not.toHaveBeenCalled();
  });
});
```

## File: tests/unit/streamFile.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamFileToResponse } from "../../src/shared/utils/streamFile";
import { AppError } from "../../src/errors/AppError";
import fs from "fs";
import path from "path";
import os from "os";

vi.mock("fs");
vi.mock("os");

describe("Unit: File Streamer", () => {
  let mockRes: any;
  let mockReadStream: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (os.tmpdir as any).mockReturnValue("/tmp");

    mockRes = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    };

    mockReadStream = {
      pipe: vi.fn(),
      on: vi.fn(),
    };
    (fs.createReadStream as any).mockReturnValue(mockReadStream);
  });

  it("throws 400 AppError if path traversal is detected", () => {
    // Attempting to stream a file outside of the OS temp directory
    expect(() => {
      streamFileToResponse(mockRes, "/etc/passwd", "hack.pdf");
    }).toThrow(AppError);
  });

  it("throws 404 AppError if file does not exist", () => {
    (fs.existsSync as any).mockReturnValue(false);
    expect(() => {
      streamFileToResponse(mockRes, "/tmp/missing.pdf", "file.pdf");
    }).toThrow(AppError);
  });

  it("successfully pipes the file to the response", () => {
    (fs.existsSync as any).mockReturnValue(true);
    // Force path.resolve to return a safe path for testing on different OSes
    vi.spyOn(path, "resolve").mockImplementation((p) =>
      p.includes("tmp") ? "/tmp" : `/tmp/${p}`,
    );

    streamFileToResponse(mockRes, "test.pdf", "download.pdf");

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(mockReadStream.pipe).toHaveBeenCalledWith(mockRes);
    expect(mockReadStream.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(mockReadStream.on).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
  });
});
```

## File: tests/unit/volunteer.service.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerVolunteerAccount,
  getVolunteersList,
  removeVolunteer,
} from "../../src/modules/admin/services/volunteer.service";
import { prisma } from "../../src/lib/prisma";
import { auth } from "../../src/lib/auth";
import { AppError } from "../../src/errors/AppError";

const prismaMock = prisma as any;

vi.mock("../../src/lib/auth", () => ({
  auth: { api: { signUpEmail: vi.fn() } },
}));

describe("Unit: Volunteer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerVolunteerAccount", () => {
    it("throws 400 if user email already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "existing" });
      await expect(
        registerVolunteerAccount("Name", "test@test.com", "pass"),
      ).rejects.toThrow(AppError);
    });

    it("registers user and returns DTO", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (auth.api.signUpEmail as any).mockResolvedValue({
        user: {
          id: "new-id",
          name: "Name",
          email: "test@test.com",
          role: "VOLUNTEER",
          createdAt: new Date(),
        },
      });

      const res = await registerVolunteerAccount(
        "Name",
        "test@test.com",
        "pass",
      );
      expect(res.id).toBe("new-id");
      expect(auth.api.signUpEmail).toHaveBeenCalled();
    });
  });

  describe("getVolunteersList", () => {
    it("maps raw DB data to VolunteerListItem list", async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: "1",
          name: "Vol 1",
          email: "v1@test.com",
          role: "VOLUNTEER",
          createdAt: new Date(),
          _count: { scanLogs: 5 },
        },
      ]);

      const res = await getVolunteersList();
      expect(res).toHaveLength(1);
      expect(res[0].totalScans).toBe(5);
    });
  });

  describe("removeVolunteer", () => {
    it("throws 404 if volunteer not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(removeVolunteer("bad-id")).rejects.toThrow(AppError);
    });

    it("throws 403 if trying to delete an ADMIN", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      await expect(removeVolunteer("admin-id")).rejects.toThrow(AppError);
    });

    it("soft deletes the volunteer", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ role: "VOLUNTEER" });
      prismaMock.user.update.mockResolvedValue({});

      await removeVolunteer("vol-id");
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { deletedAt: expect.any(Date) } }),
      );
    });
  });
});
```

## File: vitest.config.ts
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "prisma/",
        "dist/",
        "**/*.types.ts",
        "**/index.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
```

## File: prisma.config.ts
```typescript
/// <reference types="node" />

// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## File: src/errors/formatters/handlePrismaError.ts
```typescript
import { TGenericErrorResponse } from "../../types/error.interface";

export interface PrismaErrorLike {
  code: string;
  meta?: { target?: string[] };
}

export const handlePrismaError = (
  err: PrismaErrorLike,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database Error";
  let errorSources = [
    { path: "", message: "Something went wrong with the database" },
  ];

  switch (err.code) {
    case "P2025":
      statusCode = 404;
      message = "Record not found";
      errorSources = [
        { path: "", message: "The requested record does not exist." },
      ];
      break;
    case "P2002": {
      const target = err.meta?.target || ["unknown_field"];
      statusCode = 409;
      message = "Duplicate Entry";
      errorSources = target.map((field) => ({
        path: field,
        message: `A record with this ${field} already exists.`,
      }));
      break;
    }
    case "P2003":
      statusCode = 409;
      message = "Foreign Key Constraint Failed";
      errorSources = [
        {
          path: "",
          message:
            "A related record could not be found or a constraint failed.",
        },
      ];
      break;
    case "P2014":
      statusCode = 409;
      message = "Required Relation Violated";
      errorSources = [
        {
          path: "",
          message: "A required relation between records was violated.",
        },
      ];
      break;
    case "P2021":
      statusCode = 500;
      message = "Table Does Not Exist";
      errorSources = [
        { path: "", message: "The queried database table does not exist." },
      ];
      break;
    case "P2024":
      statusCode = 503;
      message = "Connection Pool Timeout";
      errorSources = [
        {
          path: "",
          message:
            "Could not connect to the database within the timeout period.",
        },
      ];
      break;
  }

  return { statusCode, message, errorSources };
};
```

## File: src/lib/prisma.ts
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client";
import { envConfig } from "../shared/config/env";
import { logger } from "../shared/logger";

const connectionString = `${envConfig.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const prisma = new PrismaClient({ adapter });

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connection established.");
  } catch (error) {
    logger.error({ error }, "Failed to connect to the database.");
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info("Database connection closed.");
};

export { prisma };
```

## File: src/middlewares/adminMiddleware.ts
```typescript
import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required.",
      errorSources: [],
    });
    return;
  }

  next();
};
```

## File: src/middlewares/globalErrorHandler.ts
```typescript
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { handleZodError } from "../errors/formatters/handleZodError";
import { handlePrismaError } from "../errors/formatters/handlePrismaError";
import { TErrorSources } from "../types/error.interface";
import { Prisma } from "../../prisma/generated/client";
import { envConfig } from "../shared/config/env";
import { logger } from "../shared/logger";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorSources: TErrorSources = [
    { path: "", message: "Something went wrong" },
  ];

  const isPrismaError =
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError;

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Database Initialization Error";
    errorSources = [
      { path: "", message: "Could not connect to the database." },
    ];
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Database Unknown Request Error";
    errorSources = [
      { path: "", message: "An unknown database error occurred." },
    ];
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Database Engine Error";
    errorSources = [{ path: "", message: "The database engine crashed." }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled Error Caught");
  }

  if (envConfig.NODE_ENV === "production" && isPrismaError) {
    message = "Database Error";
    errorSources = [{ path: "", message: "A database operation failed." }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: envConfig.NODE_ENV === "development" ? err.stack : undefined,
  });
};
```

## File: src/middlewares/notFoundHandler.ts
```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      404,
      `The route ${req.originalUrl} does not exist on this server.`,
    ),
  );
};
```

## File: src/modules/admin/services/emailWorker.service.ts
```typescript
import { prisma } from "../../../lib/prisma";
import { sendAttendeeTicketEmail } from "./email.service";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isEmailWorkerRunning = false;

export const startBackgroundEmailBatch = async (): Promise<void> => {
  if (isEmailWorkerRunning) return;
  isEmailWorkerRunning = true;

  try {
    while (true) {
      const nextAttendee = await prisma.attendee.findFirst({
        where: { emailStatus: "PENDING" },
      });

      if (!nextAttendee) {
        isEmailWorkerRunning = false;
        break;
      }

      try {
        await sendAttendeeTicketEmail(nextAttendee.id);

        await prisma.attendee.update({
          where: { id: nextAttendee.id },
          data: { emailStatus: "SENT" },
        });
      } catch (error) {
        console.error(`Failed to email ${nextAttendee.email}:`, error);

        await prisma.attendee.update({
          where: { id: nextAttendee.id },
          data: { emailStatus: "FAILED" },
        });
      }

      await delay(30000);
    }
  } catch (fatalError) {
    console.error("Fatal error in email worker:", fatalError);
    isEmailWorkerRunning = false;
  }
};

export const getEmailProgressStats = async () => {
  const [pending, sent, failed, total] = await Promise.all([
    prisma.attendee.count({ where: { emailStatus: "PENDING" } }),
    prisma.attendee.count({ where: { emailStatus: "SENT" } }),
    prisma.attendee.count({ where: { emailStatus: "FAILED" } }),
    prisma.attendee.count(),
  ]);

  return {
    isRunning: isEmailWorkerRunning,
    pending,
    sent,
    failed,
    total,
    progressPercentage:
      total === 0 ? 0 : Math.round(((sent + failed) / total) * 100),
  };
};
```

## File: src/modules/admin/services/volunteer.service.ts
```typescript
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { AppError } from "../../../errors/AppError";
import {
  CreateVolunteerDTO,
  VolunteerListItem,
} from "../types/volunteer.types";

export const registerVolunteerAccount = async (
  name: string,
  email: string,
  password: string,
): Promise<CreateVolunteerDTO> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(400, "An account with this email already exists.");
  }

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role: "VOLUNTEER",
    },
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role || "VOLUNTEER",
    createdAt: result.user.createdAt,
  };
};

export const getVolunteersList = async (): Promise<VolunteerListItem[]> => {
  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER", deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { scanLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (volunteers.length === 0) return [];

  const volunteerIds = volunteers.map((v) => v.id);

  const scanStats = await prisma.scanLog.groupBy({
    by: ["volunteerId", "status"],
    where: { volunteerId: { in: volunteerIds } },
    _count: { _all: true },
  });

  return volunteers.map((volunteer) => {
    const vStats = scanStats.filter((s) => s.volunteerId === volunteer.id);

    const getCount = (statusName: string) =>
      vStats.find((s) => s.status === statusName)?._count._all || 0;

    return {
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      role: volunteer.role || "VOLUNTEER",
      createdAt: volunteer.createdAt,
      totalScans: volunteer._count.scanLogs,
      successScans: getCount("SUCCESS"),
      duplicateScans: getCount("DUPLICATE"),
      invalidScans: getCount("INVALID"),
    };
  });
};

export const removeVolunteer = async (volunteerId: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { id: volunteerId, deletedAt: null },
  });

  if (!existingUser) throw new AppError(404, "Volunteer not found.");
  if (existingUser.role === "ADMIN")
    throw new AppError(403, "Cannot delete other Admins.");

  await prisma.user.update({
    where: { id: volunteerId },
    data: { deletedAt: new Date() },
  });
};

export const wipeAllVolunteers = async (): Promise<void> => {
  await prisma.user.deleteMany({
    where: { role: "VOLUNTEER" },
  });
};
```

## File: src/modules/admin/types/csv.types.ts
```typescript
export interface CsvRow {
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  phone: string;
  semester: string;
  team: string;
  role: string;
  segment: string;
}

export interface ParsedCsvRow extends CsvRow {
  // Can be extended later if CSV cleaning logic requires specific parsed types
}
```

## File: src/modules/admin/types/volunteer.types.ts
```typescript
export interface VolunteerListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  totalScans: number;
  successScans: number;
  duplicateScans: number;
  invalidScans: number;
}

export interface CreateVolunteerDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}
```

## File: src/modules/inventory/inventory.controller.ts
```typescript
import { Request, Response } from "express";
import { getInventoryStats, getSystemHealth } from "./inventory.service";
import { catchAsync } from "../../shared/catchAsync";

export const handleGetInventory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const stats = await getInventoryStats();
    res.status(200).json(stats);
  },
);

export const handleGetHealth = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const health = await getSystemHealth();
    const statusCode = health.database.status === "up" ? 200 : 503;
    res.status(statusCode).json(health);
  },
);
```

## File: src/modules/inventory/inventory.routes.ts
```typescript
import { Router } from "express";
import { handleGetInventory, handleGetHealth } from "./inventory.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/health", handleGetHealth);
router.get("/", requireAuth, handleGetInventory);

export const inventoryRoutes = router;
```

## File: src/modules/scan/scan.controller.ts
```typescript
import { Request, Response } from "express";
import { processScan } from "./scan.service";
import { scanRequestSchema } from "./scan.schema";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";

export const handleScan = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { qrToken } = scanRequestSchema.parse(req.body);

    if (!req.user) {
      throw new AppError(401, "Unauthorized. Missing user context.");
    }

    const volunteerId = req.user.id;
    const result = await processScan(qrToken, volunteerId);

    let statusCode = 200;
    if (result.status === "INVALID") statusCode = 404;
    else if (result.status === "DUPLICATE") statusCode = 409;
    else if (result.status === "DEPLETED") statusCode = 400;

    res.status(statusCode).json(result);
  },
);
```

## File: src/modules/scan/scan.routes.ts
```typescript
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
```

## File: src/modules/scan/scan.schema.ts
```typescript
import { z } from "zod";

export const scanRequestSchema = z.object({
  qrToken: z
    .string({
      message: "QR Token is required and must be a valid string",
    })
    .min(1, "QR Token cannot be empty"),
});
```

## File: src/modules/scan/scan.types.ts
```typescript
import { Attendee } from "../../../prisma/generated/client";

export type ScanResult =
  | { status: "INVALID"; message: string }
  | {
      status: "DUPLICATE";
      message: string;
      attendee: {
        name: string;
        email: string;
        studentId: string;
        semester: string | null;
        team: string | null;
        university: string | null;
        segment: string | null;
        claimedAt: Date | null;
      };
    }
  | { status: "SUCCESS"; message: string; attendee: Attendee }
  | { status: "DEPLETED"; message: string };
```

## File: src/modules/volunteer/volunteer.types.ts
```typescript
import { ScanStatus } from "../../../prisma/generated/enums";
import { PaginatedResponse } from "../../types";

export interface VolunteerLogEntry {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  attendeeName: string | null;
  attendeeEmail: string | null;
  studentId: string | null;
  segment: string | null;
  university: string | null;
  semester: string | null;
  team: string | null;
  volunteerName: string | null;
  volunteerEmail: string | null;
}

export type PaginatedVolunteerLogs = PaginatedResponse<VolunteerLogEntry>;
```

## File: src/shared/catchAsync.ts
```typescript
import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## File: src/types/express.d.ts
```typescript
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VOLUNTEER";
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    export interface Request {
      user?: AppUser;
      session?: unknown;
    }
  }
}
```

## File: src/middlewares/authMiddleware.ts
```typescript
import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AppUser } from "../types";
import { logger } from "../shared/logger";
import { prisma } from "../lib/prisma";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
        errorSources: [],
      });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletedAt: true },
    });

    if (!dbUser || dbUser.deletedAt !== null) {
      res.status(403).json({
        success: false,
        message: "Forbidden. Account has been disabled or deleted.",
        errorSources: [],
      });
      return;
    }

    req.user = session.user as AppUser;
    req.session = session.session;

    next();
  } catch (error) {
    logger.error({ error }, "Authentication error in middleware");
    res.status(500).json({
      success: false,
      message: "Internal Server Error during authentication.",
      errorSources: [],
    });
  }
};
```

## File: src/modules/admin/types/log.types.ts
```typescript
import { ScanStatus } from "../../../../prisma/generated/enums";
import { PaginatedResponse } from "../../../types";

export interface FormattedLog {
  id: string;
  status: ScanStatus;
  scannedToken: string;
  scannedAt: Date;
  volunteerName: string | null;
  volunteerEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
  studentId: string | null;
  segment: string | null;
  university: string | null;
  department: string | null;
  phone: string | null;
  semester: string | null;
  team: string | null;
}

export interface LogFilterOptions {
  status?: ScanStatus;
  search?: string;
  segment?: string;
  volunteerEmail?: string;
}
export type PaginatedLogResponse = PaginatedResponse<FormattedLog>;
```

## File: src/modules/inventory/inventory.service.ts
```typescript
import { prisma } from "../../lib/prisma";
import { InventoryStats, SystemHealth } from "./inventory.types";

export const getInventoryStats = async (): Promise<InventoryStats> => {
  const [
    logisticsConfig,
    totalServed,
    duplicateScans,
    invalidTickets,
    totalParticipants,
  ] = await Promise.all([
    prisma.eventLogistics.findUnique({ where: { id: 1 } }),
    prisma.attendee.count({ where: { foodClaimed: true } }),
    prisma.scanLog.count({ where: { status: "DUPLICATE" } }),
    prisma.scanLog.count({ where: { status: "INVALID" } }),
    prisma.attendee.count(),
  ]);

  const totalAvailable = logisticsConfig?.totalAvailable || 0;

  return {
    totalAvailable,
    totalServed,
    totalParticipants,
    duplicateScans,
    invalidTickets,
    percentageClaimed:
      totalAvailable > 0 ? Math.round((totalServed / totalAvailable) * 100) : 0,
  };
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const start = Date.now();
  let dbStatus: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch (error) {
    dbStatus = "down";
  }

  const latencyMs = Date.now() - start;
  const memoryUsage = process.memoryUsage();

  return {
    database: {
      status: dbStatus,
      latencyMs,
    },
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || "1.0.0",
  };
};
```

## File: src/modules/volunteer/volunteer.routes.ts
```typescript
import { Router } from "express";
import { handleGetVolunteerLogs } from "./volunteer.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/logs", requireAuth, handleGetVolunteerLogs);

export const volunteerRoutes = router;
```

## File: src/shared/utils/streamFile.ts
```typescript
import fs from "fs";
import path from "path";
import os from "os";
import { Response } from "express";
import { AppError } from "../../errors/AppError";
import { logger } from "../logger";

export const streamFileToResponse = (
  res: Response,
  filePath: string,
  filename: string,
): void => {
  const resolvedPath = path.resolve(filePath);
  const tmpDirPath = path.resolve(os.tmpdir());

  if (!resolvedPath.startsWith(tmpDirPath)) {
    throw new AppError(400, "Invalid file path. Path traversal detected.");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new AppError(404, "File not found.");
  }

  const stat = fs.statSync(resolvedPath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", stat.size.toString());

  const readStream = fs.createReadStream(resolvedPath);
  let isCleanedUp = false;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    fs.unlink(resolvedPath, (err) => {
      if (err && err.code !== "ENOENT") {
        logger.error({ err }, "Failed to delete temporary file.");
      }
    });
  };

  readStream.pipe(res);

  readStream.on("end", cleanup);

  readStream.on("error", (err) => {
    cleanup();
    logger.error({ err }, "Error streaming file.");
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error streaming file.",
        errorSources: [],
      });
    }
  });

  res.on("close", cleanup);
};
```

## File: .gitignore
```
node_modules
# Keep environment variables out of version control
.env

generated
scripts/
coverage
```

## File: src/modules/admin/services/email.service.ts
```typescript
import QRCode from "qrcode";
import { envConfig } from "../../../shared/config/env";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";

export const sendAttendeeTicketEmail = async (
  attendeeId: string,
): Promise<void> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) {
    throw new AppError(404, "Attendee not found.");
  }

  const qrImageBuffer = await QRCode.toBuffer(attendee.qrToken, {
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const qrBase64 = qrImageBuffer.toString("base64");

  const ASSETS = {
    headerImg: "https://i.ibb.co.com/NnJB8FfD/header-banner.png",
    memoriesBubbleImg: "https://i.ibb.co.com/h1KS2FJ2/callout.png",
    robotImg: "https://i.ibb.co.com/ynkLFP3t/robot.png",
    footerImg: "https://i.ibb.co.com/qYHKBfWy/footer.png",
  };

  const htmlTemplate = `
<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .content-padding { padding: 30px; }
        .text-purple { color: #5b21b6; }
        table { width: 100%; border-collapse: collapse; }
        .card { background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-sizing: border-box; }
        .label { font-weight: bold; color: #475569; font-size: 14px; width: 120px; padding-bottom: 12px;}
        .value { color: #0f172a; font-size: 14px; padding-bottom: 12px;}
        .icon { font-size: 16px; margin-right: 6px; }
        
        /* --- MOBILE RESPONSIVENESS --- */
        @media only screen and (max-width: 600px) {
          body { padding: 10px; }
          .content-padding { padding: 15px !important; }
          
          /* Force table columns to stack vertically */
          .stack-column {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            text-align: center !important;
          }
          
          /* Left-aligned stacked column for details */
          .stack-column-left {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            text-align: left !important;
          }

          /* Add spacing between stacked elements */
          .mobile-mb {
            margin-bottom: 25px !important;
          }
          
          /* Adjust image sizes for mobile */
          .memories-img {
            width: 140px !important;
            margin: 15px auto 0 !important;
            display: block !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${ASSETS.headerImg}" alt="SMUCT CSE FEST V3" style="width: 100%; display: block; border: 0;" />
        
        <div class="content-padding">
          <!-- WELCOME SECTION -->
          <table>
            <tr>
              <td class="stack-column-left mobile-mb">
                <h2 style="margin: 0; color: #0f172a; font-size: 24px;">Hello <span class="text-purple">${attendee.name}</span>,</h2>
                <p style="color: #475569; line-height: 1.6; margin-top: 10px;">We are excited to see you at the fest! Below are your registration details and your official QR Code Food Pass. Please present this QR code to the volunteers at the food distribution desk.</p>
              </td>
              <td class="stack-column" style="width: 200px; text-align: right; vertical-align: top;">
                <img src="${ASSETS.memoriesBubbleImg}" class="memories-img" alt="Let's make some memories" style="width: 180px;" />
              </td>
            </tr>
          </table>

          <div style="height: 30px;"></div>

          <!-- DETAILS AND QR SECTION -->
          <table>
            <tr>
              <td class="stack-column-left mobile-mb" style="width: 50%; vertical-align: top; padding-right: 15px;">
                <div class="card">
                  <h3 class="text-purple" style="margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">PARTICIPANT DETAILS</h3>
                  <table>
                    <tr><td class="label"><span class="icon">🆔</span> ID:</td><td class="value"><strong>${attendee.studentId}</strong></td></tr>
                    <tr><td class="label"><span class="icon">👤</span> Name:</td><td class="value">${attendee.name}</td></tr>
                    <tr><td class="label"><span class="icon">🏷️</span> Segment:</td><td class="value text-purple"><strong>${attendee.segment}</strong></td></tr>
                    <tr><td class="label"><span class="icon">🎓</span> University:</td><td class="value">${attendee.university}</td></tr>
                    <tr><td class="label"><span class="icon">🏢</span> Dept:</td><td class="value">${attendee.department || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📞</span> Phone:</td><td class="value">${attendee.phone || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📧</span> Email:</td><td class="value">${attendee.email}</td></tr>
                    <tr><td class="label"><span class="icon">📅</span> Semester:</td><td class="value">${attendee.semester || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">🏫</span> Team:</td><td class="value">${attendee.team || "N/A"}</td></tr>
                  </table>
                </div>
              </td>

              <td class="stack-column-left" style="width: 50%; vertical-align: top; padding-left: 15px;">
                <div style="border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: center;">
                  <div style="background-color: #5b21b6; color: white; padding: 10px; font-weight: bold; letter-spacing: 1px;">
                    ★ FOOD PASS ★
                  </div>
                  <div style="padding: 20px;">
                    <img src="cid:Your_Food_Pass_QR_Code.png" alt="Your Food Pass QR Code" style="width: 200px; height: 200px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 0 auto;" />
                    <p class="text-purple" style="font-weight: bold; margin-bottom: 0; margin-top: 10px;">SCAN FOR FOOD</p>
                  </div>
                </div>
                
                <div style="background-color: #fef08a; border-radius: 8px; padding: 15px; margin-top: 15px; font-size: 12px; color: #854d0e;">
                  <strong>⚠️ IMPORTANT REMINDER</strong>
                  <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                    <li>This pass is non-transferable.</li>
                    <li>Valid only during the event days.</li>
                    <li>Keep your QR code clearly visible.</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
          
          <div style="height: 30px;"></div>

          <!-- FOOTER DETAILS SECTION -->
          <div class="card">
            <table style="width: 100%;">
              <tr>
                <td class="stack-column mobile-mb" style="width: 35%; vertical-align: top; padding-right: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">EVENT INFORMATION</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.8; margin: 0;">
                    <strong>🗓️ Date:</strong> 18 July, 2026<br>
                    <strong>⏰ Time:</strong> 09:00 AM - 08:00 PM<br>
                    <strong>📍 Venue:</strong> SMUCT Campus <br>
                    <strong>💬 Queries:</strong> csefest@smuct.ac.bd
                  </p>
                </td>
                <td class="stack-column mobile-mb" style="width: 30%; text-align: center; vertical-align: middle;">
                   <img src="${ASSETS.robotImg}" alt="Mascot" style="width: 130px; display: inline-block;" />
                </td>
                <td class="stack-column" style="width: 35%; vertical-align: top; padding-left: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">DEVELOPED BY</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.8; margin: 0;">
                    ⚡ No one knows who 👻
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <img src="${ASSETS.footerImg}" alt="Thank you for being part of SMUCT CSE FEST V3" style="width: 100%; display: block; border: 0;" />
      </div>
      
      <!-- DOWNLOAD BUTTON -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${envConfig.BACKEND_URL || "http://localhost:5000"}/api/tickets/${attendee.id}/download" 
           style="background-color: #5b21b6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(91, 33, 182, 0.2);">
          📥 Download Full Ticket as PDF
        </a>
      </div>
    </body>
    </html>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": envConfig.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: {
        name: "SMUCT CSE FEST",
        email: envConfig.FROM_EMAIL,
      },
      to: [
        {
          email: attendee.email,
          name: attendee.name,
        },
      ],
      subject: "Your Event Ticket & Food Pass - SMUCT CSE FEST V3",
      htmlContent: htmlTemplate,
      attachment: [
        {
          name: "Your_Food_Pass_QR_Code.png",
          content: qrBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Brevo API Error:", errorData);
    throw new AppError(500, "Failed to send email via Brevo API.");
  }
};
```

## File: src/modules/admin/services/logs.service.ts
```typescript
import { Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../../lib/prisma";
import {
  FormattedLog,
  LogFilterOptions,
  PaginatedLogResponse,
} from "../types/log.types";

export const getSystemLogs = async (
  page: number,
  limit: number,
  filters: LogFilterOptions,
): Promise<PaginatedLogResponse> => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.ScanLogWhereInput = {};

  if (filters.status && filters.status !== ("ALL" as any)) {
    whereClause.status = filters.status;
  }

  if (filters.volunteerEmail && filters.volunteerEmail !== "ALL") {
    whereClause.volunteer = { email: filters.volunteerEmail };
  }

  const attendeeFilter: Prisma.AttendeeWhereInput = {};

  if (filters.segment && filters.segment !== "ALL") {
    attendeeFilter.segment = filters.segment;
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = filters.search.trim();
    attendeeFilter.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { studentId: { contains: searchTerm, mode: "insensitive" } },
      { university: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (Object.keys(attendeeFilter).length > 0) {
    whereClause.attendee = attendeeFilter;
  }

  const [total, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        volunteer: { select: { name: true, email: true } },
        attendee: {
          select: {
            name: true,
            studentId: true,
            segment: true,
            email: true,
            university: true,
            department: true,
            phone: true,
            semester: true,
            team: true,
          },
        },
      },
    }),
  ]);

  const formattedLogs: FormattedLog[] = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "",
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || null,
    volunteerEmail: log.volunteer?.email || null,
    attendeeName: log.attendee?.name || null,
    attendeeEmail: log.attendee?.email || null,
    studentId: log.attendee?.studentId || null,
    segment: log.attendee?.segment || null,
    university: log.attendee?.university || null,
    department: log.attendee?.department || null,
    phone: log.attendee?.phone || null,
    semester: log.attendee?.semester || null,
    team: log.attendee?.team || null,
  }));

  return {
    data: formattedLogs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

export const getLogFilterOptions = async (): Promise<{
  categories: { name: string; count: number }[];
  volunteers: { name: string; email: string; count: number }[];
}> => {
  const volunteerLogs = await prisma.scanLog.groupBy({
    by: ["volunteerId"],
    _count: { id: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: volunteerLogs.map((v) => v.volunteerId) } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(
    users.map((u) => [u.id, { name: u.name, email: u.email }]),
  );

  const volunteers = volunteerLogs
    .map((v) => {
      const userData = userMap.get(v.volunteerId) || {
        name: "Unknown",
        email: "unknown",
      };
      return {
        name: userData.name,
        email: userData.email,
        count: v._count.id,
      };
    })
    .sort((a, b) => b.count - a.count);

  const attendeeLogs = await prisma.scanLog.groupBy({
    by: ["attendeeId"],
    where: { attendeeId: { not: null } },
    _count: { id: true },
  });

  const attendees = await prisma.attendee.findMany({
    where: {
      id: { in: attendeeLogs.map((a) => a.attendeeId as string) },
    },
    select: { id: true, segment: true },
  });

  const attendeeMap = new Map(attendees.map((a) => [a.id, a.segment]));
  const segmentMap = new Map<string, number>();

  for (const log of attendeeLogs) {
    const segmentName = attendeeMap.get(log.attendeeId as string);
    if (segmentName) {
      const currentCount = segmentMap.get(segmentName) || 0;
      segmentMap.set(segmentName, currentCount + log._count.id);
    }
  }

  const categories = Array.from(segmentMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { categories, volunteers };
};
```

## File: src/modules/admin/types/attendee.types.ts
```typescript
import { PaginatedResponse } from "../../../types";

export interface AttendeeListItem {
  id: string;
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  phone: string;
  role: string;
  segment: string;
  semester: string;
  team: string;
  qrToken: string;
  foodClaimed: boolean;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  scannerName: string | null;
  scannerRole: string | null;
}

export interface AttendeeFilterOptions {
  search?: string;
  role?: string;
  segment?: string;
  status?: "CLAIMED" | "UNCLAIMED";
  university?: string;
}

export type PaginatedAttendeeResponse = PaginatedResponse<AttendeeListItem>;
```

## File: src/modules/volunteer/volunteer.controller.ts
```typescript
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { getVolunteerLogs } from "./volunteer.service";
import { getVolunteerLogsSchema } from "./volunteer.schema";
import { AppError } from "../../errors/AppError";

export const handleGetVolunteerLogs = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = getVolunteerLogsSchema.parse(req.query);

    if (!req.user) {
      throw new AppError(401, "Unauthorized. Missing user context.");
    }

    const logsData = await getVolunteerLogs(
      req.user.id,
      filters.page,
      filters.limit,
      {
        status: filters.status,
        search: filters.search,
      },
    );

    res.status(200).json(logsData);
  },
);
```

## File: src/modules/volunteer/volunteer.schema.ts
```typescript
import { z } from "zod";
import { ScanStatus } from "../../../prisma/generated/enums";

export const getVolunteerLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.nativeEnum(ScanStatus).optional(),
  search: z.string().optional(),
});
```

## File: src/server.ts
```typescript
import { Server } from "node:http";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./lib";
import { envConfig } from "./shared/config/env";
import { logger } from "./shared/logger";

const PORT = envConfig.PORT;

let server: Server;

const startServer = async () => {
  try {
    await connectDatabase();
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();

const shutdown = async () => {
  logger.info("🛑 Shutting down gracefully...");
  await disconnectDatabase();
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught Exception");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
```

## File: src/modules/volunteer/volunteer.service.ts
```typescript
import { Prisma } from "../../../prisma/generated/client";
import { ScanStatus } from "../../../prisma/generated/enums";
import { prisma } from "../../lib/prisma";
import { PaginatedVolunteerLogs } from "./volunteer.types";

export interface VolunteerLogFilterOptions {
  status?: ScanStatus;
  search?: string;
}

export const getVolunteerLogs = async (
  volunteerId: string,
  page: number,
  limit: number,
  filters: VolunteerLogFilterOptions,
): Promise<PaginatedVolunteerLogs> => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ScanLogWhereInput = { volunteerId };

  if (filters.status) {
    whereClause.status = filters.status;
  }

  const attendeeFilter: Prisma.AttendeeWhereInput = {};

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    attendeeFilter.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { studentId: { contains: term, mode: "insensitive" } },
      { university: { contains: term, mode: "insensitive" } },
    ];
  }

  if (Object.keys(attendeeFilter).length > 0) {
    whereClause.attendee = attendeeFilter;
  }

  const [total, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        attendee: {
          select: {
            name: true,
            university: true,
            segment: true,
            email: true,
            studentId: true,
            semester: true,
            team: true,
          },
        },
        volunteer: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "",
    scannedAt: log.scannedAt,
    attendeeName: log.attendee?.name || null,
    attendeeEmail: log.attendee?.email || null,
    studentId: log.attendee?.studentId || null,
    segment: log.attendee?.segment || null,
    university: log.attendee?.university || null,
    semester: log.attendee?.semester || null,
    team: log.attendee?.team || null,
    volunteerName: log.volunteer?.name || null,
    volunteerEmail: log.volunteer?.email || null,
  }));

  return {
    data: formattedLogs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};
```

## File: src/shared/config/env.ts
```typescript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const urlValidator = z.string().refine(
  (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid URL format" },
);

const envSchema = z.object({
  DATABASE_URL: urlValidator,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: urlValidator,
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: urlValidator.optional(),
  BACKEND_URL: urlValidator.optional(),
  BREVO_API_KEY: z.string().min(1, "Brevo API key is required"),
  TRUSTED_ORIGINS: z.string().optional(),
  FROM_EMAIL: z.email("FROM_EMAIL must be a valid email"),
});

export const envConfig = envSchema.parse(process.env);
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "rootDir": ".",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "ignoreDeprecations": "6.0",
    "moduleResolution": "bundler",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "prisma/generated/client/**/*"],
  "exclude": ["node_modules", "dist", "**/*.config.ts", "scripts/"]
}
```

## File: src/lib/auth.ts
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envConfig } from "../shared/config/env";
import { bearer } from "better-auth/plugins";

const parseTrustedOrigins = (): string[] => {
  const baseOrigins = ["festfoodmanagermobile://", "exp://"];

  if (envConfig.APP_URL) {
    baseOrigins.push(envConfig.APP_URL);
  }

  if (envConfig.TRUSTED_ORIGINS) {
    const extra = envConfig.TRUSTED_ORIGINS.split(",").map((o) => o.trim());
    baseOrigins.push(...extra);
  }

  return envConfig.NODE_ENV === "development"
    ? ["*", ...baseOrigins]
    : baseOrigins;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: envConfig.BETTER_AUTH_URL,
  trustedOrigins: parseTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "VOLUNTEER",
      },
    },
  },
});
```

## File: src/modules/admin/services/attendee.service.ts
```typescript
import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";
import { buildPdfTicketsToDisk } from "../../../shared/utils/pdfGenerator";
import { CsvRow } from "../types/csv.types";
import {
  AttendeeFilterOptions,
  AttendeeListItem,
  PaginatedAttendeeResponse,
} from "../types/attendee.types";
import { Prisma } from "../../../../prisma/generated/client";

const csvRowSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  studentId: z.string().min(1),
  university: z.string().min(1),
  department: z.string().min(1),
  phone: z.string().min(1),
  semester: z.string().min(1),
  team: z.string().min(1),
  role: z.string().min(1),
  segment: z.string().min(1),
});

export const uploadAttendeesFromCsv = async (
  fileBuffer: Buffer,
): Promise<{ insertedCount: number; insertedIds: string[] }> => {
  const records = parse(fileBuffer, {
    columns: (headerList) => headerList.map((header: string) => header.trim()),
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as Record<string, unknown>[];

  const cleanedRecords: CsvRow[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    const cleanedRow = {
      name: String(row["Name"] || "").trim(),
      email: String(row["Email"] || "")
        .trim()
        .toLowerCase(),
      studentId: String(row["Student ID"] || "").trim(),
      university: String(row["University"] || "").trim(),
      department: String(row["Department"] || "").trim(),
      phone: String(row["Phone"] || "").trim(),
      semester: String(row["Semester"] || "").trim(),
      team: String(row["Team"] || "").trim(),
      role: String(row["Role"] || "").trim(),
      segment: String(row["Segment"] || "").trim(),
    };

    const validation = csvRowSchema.safeParse(cleanedRow);
    if (!validation.success) {
      throw new AppError(
        400,
        `Row ${i + 2} (Email: ${row["Email"] || "Unknown"}) has invalid data. Error: ${validation.error.issues[0].message}`,
      );
    }

    cleanedRecords.push(validation.data);
  }

  const newAttendeesData = cleanedRecords.map((record) => ({
    ...record,
    id: uuidv4(),
    qrToken: uuidv4(),
  }));

  const insertedCount = newAttendeesData.length;

  if (insertedCount === 0) {
    throw new AppError(400, "The uploaded CSV contains no valid data.");
  }

  await prisma.attendee.createMany({
    data: newAttendeesData,
  });

  const insertedIds = newAttendeesData.map((a) => a.id);

  return { insertedCount, insertedIds };
};

export const generatePdfTicketsForIds = async (
  attendeeIds: string[],
): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    where: { id: { in: attendeeIds } },
  });
  return await buildPdfTicketsToDisk(attendees);
};

export const generateAllPdfTicketsBackup = async (): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    orderBy: { createdAt: "asc" },
  });
  return await buildPdfTicketsToDisk(attendees);
};

export const getAttendeesList = async (
  page: number,
  limit: number,
  filters: AttendeeFilterOptions,
): Promise<PaginatedAttendeeResponse> => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.AttendeeWhereInput = {};

  if (filters.status === "CLAIMED") whereClause.foodClaimed = true;
  else if (filters.status === "UNCLAIMED") whereClause.foodClaimed = false;

  if (filters.segment && filters.segment !== "ALL") {
    whereClause.segment = filters.segment;
  }
  if (filters.role && filters.role !== "ALL") {
    whereClause.role = filters.role;
  }

  if (filters.university && filters.university !== "ALL") {
    whereClause.university = filters.university;
  }

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { qrToken: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { studentId: { contains: term, mode: "insensitive" } },
    ];
  }

  const [totalCount, attendees] = await Promise.all([
    prisma.attendee.count({ where: whereClause }),
    prisma.attendee.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip,
      take: limit,
      include: {
        scanLogs: {
          where: { status: { in: ["SUCCESS", "MANUAL_OVERRIDE"] } },
          include: { volunteer: { select: { name: true, role: true } } },
        },
      },
    }),
  ]);

  const formattedAttendees: AttendeeListItem[] = attendees.map((attendee) => {
    const successLog = attendee.scanLogs[0];
    return {
      id: attendee.id,
      name: attendee.name,
      email: attendee.email,
      studentId: attendee.studentId,
      university: attendee.university,
      department: attendee.department,
      phone: attendee.phone,
      role: attendee.role,
      segment: attendee.segment,
      semester: attendee.semester || "",
      team: attendee.team || "",
      qrToken: attendee.qrToken,
      foodClaimed: attendee.foodClaimed,
      claimedAt: attendee.claimedAt,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
      scannerName: successLog?.volunteer?.name || null,
      scannerRole: successLog?.volunteer?.role || null,
    };
  });

  return {
    data: formattedAttendees,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
};

export const processManualOverride = async (
  attendeeId: string,
  adminId: string,
): Promise<AttendeeListItem> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) throw new AppError(404, "Attendee not found.");
  if (attendee.foodClaimed) {
    throw new AppError(409, "Attendee has already claimed their food.");
  }

  return await prisma.$transaction(async (tx) => {
    const logistics = await tx.eventLogistics.findUnique({ where: { id: 1 } });

    if (!logistics || logistics.totalAvailable <= 0) {
      throw new AppError(400, "Inventory depleted. No food available.");
    }

    await tx.eventLogistics.update({
      where: { id: 1 },
      data: { totalAvailable: { decrement: 1 } },
    });

    const updatedAttendee = await tx.attendee.update({
      where: { id: attendeeId },
      data: { foodClaimed: true, claimedAt: new Date() },
    });

    await tx.scanLog.create({
      data: {
        status: "MANUAL_OVERRIDE",
        volunteerId: adminId,
        attendeeId: attendee.id,
        scannedToken: attendee.qrToken,
      },
    });

    return {
      ...updatedAttendee,
      semester: updatedAttendee.semester || "",
      team: updatedAttendee.team || "",
      scannerName: null,
      scannerRole: null,
    };
  });
};

export const wipeAllAttendees = async (): Promise<{
  deletedCount: number;
  message: string;
}> => {
  await prisma.scanLog.deleteMany({});
  const result = await prisma.attendee.deleteMany({});

  return {
    deletedCount: result.count,
    message: `Successfully deleted ${result.count} attendees and cleared all scan logs.`,
  };
};

export const getAttendeeFilterOptions = async (): Promise<{
  categories: { name: string; count: number }[];
  universities: { name: string; count: number }[];
}> => {
  const [segmentResult, universityResult] = await Promise.all([
    prisma.attendee.groupBy({
      by: ["segment"],
      _count: { segment: true },
      orderBy: { segment: "asc" },
    }),
    prisma.attendee.groupBy({
      by: ["university"],
      _count: { university: true },
      orderBy: { university: "asc" },
    }),
  ]);

  const categories = segmentResult
    .filter((item) => item.segment)
    .map((item) => ({
      name: item.segment as string,
      count: item._count.segment,
    }));

  const universities = universityResult
    .filter((item) => item.university)
    .map((item) => ({
      name: item.university as string,
      count: item._count.university,
    }));

  return { categories, universities };
};

export const prepareAllTicketsBackup = async (): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (!attendees || attendees.length === 0) {
    throw new AppError(404, "No attendees found to generate tickets for.");
  }

  const ticketDataForPdf = attendees.map((a) => ({
    name: a.name,
    email: a.email,
    studentId: a.studentId,
    university: a.university,
    segment: a.segment,
    semester: a.semester || "",
    team: a.team || "",
    qrToken: a.qrToken,
  }));

  return await buildPdfTicketsToDisk(ticketDataForPdf);
};
```

## File: src/modules/scan/scan.service.ts
```typescript
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { ScanResult } from "./scan.types";
import { logger } from "../../shared/logger";

export const processScan = async (
  qrToken: string,
  volunteerId: string,
): Promise<ScanResult> => {
  const attendee = await prisma.attendee.findUnique({
    where: { qrToken },
  });

  if (!attendee) {
    await prisma.scanLog.create({
      data: { status: "INVALID", volunteerId, scannedToken: qrToken },
    });
    logger.info({ qrToken, volunteerId }, "Scan failed: Invalid token");
    return {
      status: "INVALID",
      message: "Ticket not found or unrecognized.",
    };
  }

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const currentAttendee = await tx.attendee.findUnique({
        where: { id: attendee.id },
      });

      if (!currentAttendee) {
        throw new AppError(404, "Attendee record is missing.");
      }

      if (currentAttendee.foodClaimed) {
        await tx.scanLog.create({
          data: {
            status: "DUPLICATE",
            volunteerId,
            attendeeId: currentAttendee.id,
            scannedToken: qrToken,
          },
        });
        return { type: "DUPLICATE", attendee: currentAttendee };
      }

      const logistics = await tx.eventLogistics.findUnique({
        where: { id: 1 },
      });

      if (!logistics || logistics.totalAvailable <= 0) {
        throw new AppError(400, "Inventory depleted. No food available.");
      }

      await tx.eventLogistics.update({
        where: { id: 1 },
        data: { totalAvailable: { decrement: 1 } },
      });

      await tx.scanLog.create({
        data: {
          status: "SUCCESS",
          volunteerId,
          attendeeId: currentAttendee.id,
          scannedToken: qrToken,
        },
      });

      const updatedAttendee = await tx.attendee.update({
        where: { id: currentAttendee.id },
        data: { foodClaimed: true, claimedAt: new Date() },
      });

      return { type: "SUCCESS", attendee: updatedAttendee };
    });

    if (txResult.type === "DUPLICATE") {
      logger.info(
        { attendeeId: attendee.id, volunteerId },
        "Scan failed: Duplicate ticket",
      );
      return {
        status: "DUPLICATE",
        message: "This ticket has already been used!",
        attendee: {
          name: txResult.attendee.name,
          email: txResult.attendee.email,
          studentId: txResult.attendee.studentId,
          semester: txResult.attendee.semester,
          team: txResult.attendee.team,
          university: txResult.attendee.university,
          segment: txResult.attendee.segment,
          claimedAt: txResult.attendee.claimedAt,
        },
      };
    }

    logger.info(
      { attendeeId: attendee.id, volunteerId },
      "Scan successful: Food claimed",
    );

    return {
      status: "SUCCESS",
      message: "Ticket validated! Serve the food.",
      attendee: txResult.attendee,
    };
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(
        { attendeeId: attendee.id, volunteerId },
        `Scan failed: ${error.message}`,
      );
      return { status: "DEPLETED", message: error.message };
    }

    logger.error({ error, attendeeId: attendee.id }, "Transaction failed");
    throw error;
  }
};
```

## File: src/modules/admin/admin.schema.ts
```typescript
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(50),
});

export const inventoryBodySchema = z.object({
  totalAvailable: z
    .number({
      message: "Total available count is required and must be a number",
    })
    .int("Total available must be an integer")
    .nonnegative("Total available cannot be negative"),
});

export const overrideBodySchema = z.object({
  attendeeId: z
    .string({ message: "Attendee ID is required and must be a valid string" })
    .uuid("Invalid Attendee ID format"),
});

export const getLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  segment: z.string().optional(),
  volunteerEmail: z.string().optional(),
});

export const getAttendeesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(25),
  status: z.enum(["ALL", "CLAIMED", "PENDING"]).default("ALL"),
  segment: z.string().optional(),
  university: z.string().optional(),
});
```

## File: prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client"
  output   = "../prisma/generated"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  role Role @default(VOLUNTEER)

  sessions Session[]
  accounts Account[]
  scanLogs ScanLog[]

  @@map("user")
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @default(uuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  idToken               String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

enum Role {
  ADMIN
  VOLUNTEER
}

enum ScanStatus {
  SUCCESS
  DUPLICATE
  INVALID
  MANUAL_OVERRIDE
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
}

model Attendee {
  id         String @id @default(uuid())
  name       String
  email      String
  studentId  String
  university String
  department String
  phone      String
  semester   String
  team       String
  role       String
  segment    String

  qrToken     String    @unique
  foodClaimed Boolean   @default(false)
  claimedAt   DateTime?
  emailStatus String    @default("PENDING")

  scanLogs ScanLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ScanLog {
  id String @id @default(uuid())

  status ScanStatus

  volunteerId String
  volunteer   User   @relation(fields: [volunteerId], references: [id], onDelete: Cascade)

  attendeeId String?
  attendee   Attendee? @relation(fields: [attendeeId], references: [id], onDelete: SetNull)

  scannedToken String?
  scannedAt    DateTime @default(now())
}

model EventLogistics {
  id             Int      @id @default(1)
  totalAvailable Int      @default(0)
  updatedAt      DateTime @updatedAt
}
```

## File: package.json
```json
{
  "name": "festfood-manager-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "prisma generate && tsup src/server.ts --format esm --clean && cp -r assets dist/assets",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.33.0",
  "dependencies": {
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "better-auth": "^1.6.9",
    "cors": "^2.8.6",
    "csv-parse": "^6.2.1",
    "csv-parser": "^3.2.1",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "helmet": "^8.1.0",
    "multer": "^2.1.1",
    "nodemailer": "^9.0.1",
    "pdfkit": "^0.18.0",
    "pg": "^8.20.0",
    "pino": "^10.3.1",
    "pino-http": "^11.0.0",
    "qrcode": "^1.5.4",
    "uuid": "^14.0.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/multer": "^2.1.0",
    "@types/node": "^25.6.1",
    "@types/nodemailer": "^8.0.1",
    "@types/pdfkit": "^0.17.6",
    "@types/pg": "^8.20.0",
    "@types/qrcode": "^1.5.6",
    "@types/supertest": "^7.2.0",
    "@vitest/coverage-v8": "4.1.8",
    "pino-pretty": "^13.1.3",
    "prisma": "^7.8.0",
    "supertest": "^7.2.2",
    "ts-node": "^10.9.2",
    "tsup": "^8.5.1",
    "tsx": "^4.21.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.8",
    "vitest-mock-extended": "^4.0.0"
  }
}
```

## File: src/modules/admin/admin.routes.ts
```typescript
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { requireAuth, requireAdmin } from "../../middlewares";
import { AppError } from "../../errors/AppError";
import {
  createVolunteer,
  deleteVolunteerController,
  downloadTempPdf,
  getVolunteers,
  handleCsvUpload,
  handleGenerateTickets,
  handleGetAttendeeFilters,
  handleGetAttendees,
  handleGetEmailProgress,
  handleGetLogFilters,
  handleGetLogs,
  handleManualOverride,
  handleSendSingleEmail,
  handleStartEmailBatch,
  handleUpdateInventory,
  resetDatabase,
  resetLogistics,
  wipeVolunteersController,
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
router.post("/tickets/generate", handleGenerateTickets);
router.put("/inventory", handleUpdateInventory);
router.get("/attendees", handleGetAttendees);
router.post("/override", handleManualOverride);
router.get("/logs", handleGetLogs);
router.get("/tickets/download-temp/:filename", downloadTempPdf);

router.delete("/attendees/wipe", resetDatabase);
router.post("/logistics/reset", resetLogistics);

router.get("/volunteers", getVolunteers);
router.post("/volunteers", volunteerCreationLimiter, createVolunteer);
router.delete("/volunteers/wipe", wipeVolunteersController);
router.delete("/volunteers/:id", deleteVolunteerController);

router.get("/attendees/filters", handleGetAttendeeFilters);
router.post("/attendees/:id/email", handleSendSingleEmail);
router.post("/emails/start", handleStartEmailBatch);
router.get("/emails/progress", handleGetEmailProgress);
router.get("/logs/filters", handleGetLogFilters);

export const adminRoutes = router;
```

## File: src/app.ts
```typescript
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib";
import { logger } from "./shared/logger";
import { scanRoutes } from "./modules/scan";
import { inventoryRoutes } from "./modules/inventory";
import { adminRoutes } from "./modules/admin";
import { volunteerRoutes } from "./modules/volunteer";
import { notFoundHandler, globalErrorHandler } from "./middlewares";
import { ticketRoutes } from "./modules/tickets/tickets.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(pinoHttp({ logger }));

app.post("/api/auth/sign-up/email", (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    message:
      "Public registration is disabled. Only Admins can create volunteer accounts.",
    errorSources: [],
  });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/v1/scan", scanRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/volunteer", volunteerRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
```

## File: src/modules/admin/admin.controller.ts
```typescript
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
```
