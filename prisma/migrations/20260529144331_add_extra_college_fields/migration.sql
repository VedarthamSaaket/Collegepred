/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "college_search_idx";

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "accommodationTypes" TEXT[],
ADD COLUMN     "accreditations" TEXT[],
ADD COLUMN     "campusArea" TEXT,
ADD COLUMN     "examFees" INTEGER,
ADD COLUMN     "facultyStudentRatio" TEXT,
ADD COLUMN     "hostelAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelCompulsory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostelFeesPerYear" INTEGER,
ADD COLUMN     "libraryBooks" INTEGER,
ADD COLUMN     "messFees" INTEGER,
ADD COLUMN     "otherFees" INTEGER,
ADD COLUMN     "researchPapers" INTEGER,
ADD COLUMN     "totalStudents" INTEGER,
ADD COLUMN     "transportFees" INTEGER,
ADD COLUMN     "tuitionFees" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
