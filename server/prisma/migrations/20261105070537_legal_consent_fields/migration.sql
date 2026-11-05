-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "consentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
