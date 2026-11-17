-- AlterTable
ALTER TABLE "devices" ADD COLUMN "fcm_token" TEXT;

-- CreateIndex
CREATE INDEX "devices_user_id_idx" ON "devices"("user_id");
