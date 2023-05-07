/*
  Warnings:

  - You are about to drop the column `thumbnilUrl` on the `Docs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Docs" DROP COLUMN "thumbnilUrl",
ADD COLUMN     "thumbnail" TEXT;
