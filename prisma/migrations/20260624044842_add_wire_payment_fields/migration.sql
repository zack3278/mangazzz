/*
  Warnings:

  - A unique constraint covering the columns `[wirePaymentIntentId]` on the table `PremiumOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PremiumOrder" ADD COLUMN     "wireClientSecret" TEXT,
ADD COLUMN     "wireNextAction" TEXT,
ADD COLUMN     "wirePaymentIntentId" TEXT,
ADD COLUMN     "wireStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PremiumOrder_wirePaymentIntentId_key" ON "PremiumOrder"("wirePaymentIntentId");
