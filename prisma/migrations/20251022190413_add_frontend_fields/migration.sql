/*
  Warnings:

  - You are about to drop the column `application_deadline` on the `opportunities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."opportunities" DROP COLUMN "application_deadline",
ADD COLUMN     "applicants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contact_email" VARCHAR(255),
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "excerpt" VARCHAR(500),
ADD COLUMN     "image" VARCHAR(500),
ADD COLUMN     "organization" VARCHAR(255),
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
