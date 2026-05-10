/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");
