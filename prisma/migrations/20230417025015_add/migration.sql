/*
  Warnings:

  - You are about to drop the column `maintenanceExpensesId` on the `Investor` table. All the data in the column will be lost.
  - You are about to drop the `Expensies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[maintenanceExpenseId]` on the table `Investor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maintenanceExpenseId` to the `Investor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Expensies" DROP CONSTRAINT "Expensies_forInvestorId_fkey";

-- DropForeignKey
ALTER TABLE "Investor" DROP CONSTRAINT "Investor_maintenanceExpensesId_fkey";

-- DropIndex
DROP INDEX "Investor_maintenanceExpensesId_key";

-- AlterTable
ALTER TABLE "Investor" DROP COLUMN "maintenanceExpensesId",
ADD COLUMN     "maintenanceExpenseId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Expensies";

-- CreateTable
CREATE TABLE "Expenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "forInvestorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investor_maintenanceExpenseId_key" ON "Investor"("maintenanceExpenseId");

-- AddForeignKey
ALTER TABLE "Investor" ADD CONSTRAINT "Investor_maintenanceExpenseId_fkey" FOREIGN KEY ("maintenanceExpenseId") REFERENCES "MaintenanceExpense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_forInvestorId_fkey" FOREIGN KEY ("forInvestorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
