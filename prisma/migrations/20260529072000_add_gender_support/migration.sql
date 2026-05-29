-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'ALL');

-- AlterTable
ALTER TABLE "College" ADD COLUMN "womenOnly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CollegeCutoff" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'ALL';