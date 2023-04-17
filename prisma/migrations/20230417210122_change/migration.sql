/*
  Warnings:

  - You are about to drop the column `maintenanceExpenseId` on the `Investor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[investorId]` on the table `MaintenanceExpense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `investorId` to the `MaintenanceExpense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Investor" DROP CONSTRAINT "Investor_maintenanceExpenseId_fkey";

-- DropIndex
DROP INDEX "Investor_maintenanceExpenseId_key";

-- AlterTable
ALTER TABLE "Investor" DROP COLUMN "maintenanceExpenseId";

-- AlterTable
ALTER TABLE "MaintenanceExpense" ADD COLUMN     "investorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceExpense_investorId_key" ON "MaintenanceExpense"("investorId");

-- AddForeignKey
ALTER TABLE "MaintenanceExpense" ADD CONSTRAINT "MaintenanceExpense_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
