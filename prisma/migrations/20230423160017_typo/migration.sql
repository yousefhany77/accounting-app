/*
  Warnings:

  - You are about to drop the column `adress` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `adress` on the `Investor` table. All the data in the column will be lost.
  - Added the required column `address` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Investor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Investor" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT NOT NULL;
