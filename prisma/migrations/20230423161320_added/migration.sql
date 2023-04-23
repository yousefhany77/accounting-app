/*
  Warnings:

  - Added the required column `url` to the `Docs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Docs" ADD COLUMN     "url" TEXT NOT NULL;
