-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('IIT', 'NIT', 'IIIT', 'DEEMED', 'STATE', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('JEE_MAINS', 'JEE_ADVANCED', 'EAMCET_TS', 'EAMCET_AP');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GENERAL', 'OBC', 'SC', 'ST', 'EWS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "type" "CollegeType" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFees" INTEGER NOT NULL,
    "overview" TEXT NOT NULL,
    "established" INTEGER,
    "website" TEXT,
    "logoUrl" TEXT,
    "imageUrl" TEXT,
    "naacGrade" TEXT,
    "nirfRank" INTEGER,
    "placementAvg" INTEGER,
    "placementMax" INTEGER,
    "placementPct" DOUBLE PRECISION,
    "topRecruiters" TEXT[],
    "search_vector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "fees" INTEGER NOT NULL,
    "seats" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeCutoff" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "exam" "ExamType" NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'GENERAL',
    "rankMin" INTEGER NOT NULL,
    "rankMax" INTEGER NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "branch" TEXT,

    CONSTRAINT "CollegeCutoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCollege" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCollege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeIds" TEXT[],
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_rating_idx" ON "College"("rating");

-- CreateIndex
CREATE INDEX "College_totalFees_idx" ON "College"("totalFees");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "College_type_idx" ON "College"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCollege_userId_collegeId_key" ON "SavedCollege"("userId", "collegeId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeCutoff" ADD CONSTRAINT "CollegeCutoff_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FullTextSearch
CREATE OR REPLACE FUNCTION college_search_vector_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.type::text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER college_search_vector_update
BEFORE INSERT OR UPDATE ON "College"
FOR EACH ROW EXECUTE FUNCTION college_search_vector_trigger();

CREATE INDEX college_search_idx ON "College" USING GIN (search_vector);
