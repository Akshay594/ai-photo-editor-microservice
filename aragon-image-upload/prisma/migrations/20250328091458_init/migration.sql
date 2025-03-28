-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PROCESSING');

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "status" "ImageStatus" NOT NULL,
    "rejectionReason" TEXT,
    "similarityHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_s3Key_key" ON "Image"("s3Key");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- CreateIndex
CREATE INDEX "Image_status_idx" ON "Image"("status");

-- CreateIndex
CREATE INDEX "Image_similarityHash_idx" ON "Image"("similarityHash");
