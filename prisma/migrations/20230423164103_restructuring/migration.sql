/*
  Warnings:

  - You are about to drop the column `nameDigital` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `nameLatin` on the `Property` table. All the data in the column will be lost.
  - Added the required column `digitalName` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latinName` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "nameDigital",
DROP COLUMN "nameLatin",
ADD COLUMN     "digitalName" TEXT NOT NULL,
ADD COLUMN     "latinName" TEXT NOT NULL;
