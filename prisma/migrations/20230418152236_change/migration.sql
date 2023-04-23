/*
  Warnings:

  - The `paid` column on the `Expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paid` column on the `MaintenanceExpense` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "paid",
ADD COLUMN     "paid" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "MaintenanceExpense" DROP COLUMN "paid",
ADD COLUMN     "paid" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
