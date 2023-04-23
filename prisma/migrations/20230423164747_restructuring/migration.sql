-- DropForeignKey
ALTER TABLE "MaintenanceExpense" DROP CONSTRAINT "MaintenanceExpense_investorId_fkey";

-- AlterTable
ALTER TABLE "MaintenanceExpense" ALTER COLUMN "investorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceExpense" ADD CONSTRAINT "MaintenanceExpense_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
