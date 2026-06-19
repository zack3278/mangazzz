/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `PremiumOrder` table. All the data in the column will be lost.
  - You are about to drop the column `planMonths` on the `PremiumOrder` table. All the data in the column will be lost.
  - You are about to drop the column `transferInfo` on the `PremiumOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comic" ALTER COLUMN "genre" SET DEFAULT 'Бусад';

-- AlterTable
ALTER TABLE "PremiumOrder" DROP COLUMN "paymentMethod",
DROP COLUMN "planMonths",
DROP COLUMN "transferInfo",
ADD COLUMN     "months" INTEGER NOT NULL DEFAULT 1;
