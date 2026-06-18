-- AlterTable
ALTER TABLE "PremiumOrder" ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'BANK',
ADD COLUMN     "planMonths" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "transferInfo" TEXT,
ALTER COLUMN "invoiceId" DROP NOT NULL,
ALTER COLUMN "qrText" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "premiumExpiresAt" TIMESTAMP(3);
