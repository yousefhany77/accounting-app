/*
  Warnings:

  - You are about to drop the column `updatedBy` on the `Property` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_updatedBy_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "updatedBy";
