/*
  Warnings:

  - Added the required column `type` to the `Docs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Docs" ADD COLUMN     "type" TEXT NOT NULL;
