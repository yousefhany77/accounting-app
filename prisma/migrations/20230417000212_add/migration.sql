/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Investor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Investor" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Investor_code_key" ON "Investor"("code");
