/*
  Warnings:

  - A unique constraint covering the columns `[customId]` on the table `Investment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "customId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Investment_customId_key" ON "Investment"("customId");
