-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('opportunity', 'like', 'comment', 'reply', 'mention', 'follow', 'new_post', 'reward_point');

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "data" JSONB,
    "sender" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_push_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "public"."notifications"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "public"."notifications"("recipient_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_push_tokens_token_key" ON "public"."device_push_tokens"("token");

-- CreateIndex
CREATE INDEX "device_push_tokens_user_id_active_idx" ON "public"."device_push_tokens"("user_id", "active");
