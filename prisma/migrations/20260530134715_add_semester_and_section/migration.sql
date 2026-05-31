/*
  Warnings:

  - Added the required column `section` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "section" TEXT NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL;
