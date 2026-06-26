-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "emailStatus" TEXT NOT NULL DEFAULT 'PENDING';
