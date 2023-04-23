/*
  Warnings:

  - A unique constraint covering the columns `[bankAcc]` on the table `Investor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adress` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "adress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Docs" ADD COLUMN     "agentId" TEXT,
ADD COLUMN     "propertyId" TEXT;

-- AlterTable
ALTER TABLE "Investor" ADD COLUMN     "bank" TEXT[],
ADD COLUMN     "bankAcc" TEXT[];

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "elevators" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Investor_bankAcc_key" ON "Investor"("bankAcc");

-- AddForeignKey
ALTER TABLE "Docs" ADD CONSTRAINT "Docs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Docs" ADD CONSTRAINT "Docs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
