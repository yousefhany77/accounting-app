/*
  Warnings:

  - You are about to drop the column `bankAcc` on the `Investor` table. All the data in the column will be lost.
  - The `bank` column on the `Investor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `bank` on the `Investment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `adress` to the `Investor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Investor_bankAcc_key";

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "bank",
ADD COLUMN     "bank" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Investor" DROP COLUMN "bankAcc",
ADD COLUMN     "adress" TEXT NOT NULL,
DROP COLUMN "bank",
ADD COLUMN     "bank" JSONB[];
