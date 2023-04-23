/*
  Warnings:

  - A unique constraint covering the columns `[propertyId]` on the table `MaintenanceExpense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyId` to the `MaintenanceExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MaintenanceExpense" ADD COLUMN     "propertyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceExpense_propertyId_key" ON "MaintenanceExpense"("propertyId");

-- AddForeignKey
ALTER TABLE "MaintenanceExpense" ADD CONSTRAINT "MaintenanceExpense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
