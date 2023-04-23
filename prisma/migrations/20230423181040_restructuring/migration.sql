/*
  Warnings:

  - A unique constraint covering the columns `[digitalName]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `digitalName` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "digitalName",
ADD COLUMN     "digitalName" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Property_digitalName_key" ON "Property"("digitalName");
