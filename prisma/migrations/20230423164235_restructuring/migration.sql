-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_investorId_fkey";

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "investorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
