-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MaintenanceExpense" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Docs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "expensesId" TEXT,
    "maintenanceExpenseId" TEXT,
    "investmentId" TEXT,

    CONSTRAINT "Docs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Docs" ADD CONSTRAINT "Docs_expensesId_fkey" FOREIGN KEY ("expensesId") REFERENCES "Expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Docs" ADD CONSTRAINT "Docs_maintenanceExpenseId_fkey" FOREIGN KEY ("maintenanceExpenseId") REFERENCES "MaintenanceExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Docs" ADD CONSTRAINT "Docs_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
