/*
  Warnings:

  - You are about to drop the column `rate` on the `MaintenanceExpense` table. All the data in the column will be lost.
  - Added the required column `amount` to the `MaintenanceExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaintenanceExpense" DROP COLUMN "rate",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
