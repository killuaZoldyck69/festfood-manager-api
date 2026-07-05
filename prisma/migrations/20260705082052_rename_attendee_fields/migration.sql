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
