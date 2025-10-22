-- CreateEnum
CREATE TYPE "public"."OpportunityCategory" AS ENUM ('internship', 'scholarship', 'competition', 'gig', 'pitch', 'other');

-- CreateTable
CREATE TABLE "public"."opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."OpportunityCategory" NOT NULL,
    "location" VARCHAR(255),
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "application_deadline" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);
