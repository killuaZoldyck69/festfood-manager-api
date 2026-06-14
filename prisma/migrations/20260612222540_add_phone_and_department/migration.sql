/*
  Warnings:

  - Added the required column `department` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
