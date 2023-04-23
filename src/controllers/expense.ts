import { Expenses, MaintenanceExpense } from '@prisma/client'
import z from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { handleAsyncError } from '../util/handleAsyncError'
import { expenseSchema, maintenanceExpenseSchema } from '../util/shared/schema'
import { OmitMultiple } from '../util/types'
import { isValidUUID } from '../util/validateUUID'

export type SafeExpense = OmitMultiple<Expenses, 'createdAt' | 'id' | 'updatedAt' | 'deletedAt'>
export type SafeExpenseSchema = z.ZodType<SafeExpense>

export type SafeMaintenanceExpense = OmitMultiple<MaintenanceExpense, 'createdAt' | 'id' | 'updatedAt' | 'deletedAt'>

/* 
=================================================================
                    Maintenance Expense
This is the yearly expense that the investor pays to the company when he buys a property and it's mandatory
the value of the expense is calculated by the (area * custom_rate) and it's not related to the property price.
it can't be deleted 
=================================================================
**/

export const createMaintenanceExpense = async (expense: SafeMaintenanceExpense) => {
  try {
    const data = maintenanceExpenseSchema.safeParse(expense)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const newExpense = await prisma.maintenanceExpense.create({
      data: expense,
    })

    return newExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const linkMaintenanceExpenseToInvestor = async (investorId: string, MExpenseId: string) => {
  try {
    isValidUUID(investorId) && isValidUUID(MExpenseId)
    const updatedInvestor = await prisma.investor.update({
      where: {
        id: investorId,
      },
      data: {
        maintenanceExpense: {
          connect: {
            id: MExpenseId,
          },
        },
      },
    })
    return updatedInvestor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const getMaintenancesExpenseById = async (id: string) => {
  try {
    isValidUUID(id)
    const maintenanceExpense = await prisma.maintenanceExpense.findUnique({
      where: {
        id,
      },
    })

    return maintenanceExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
export const getAllMaintenancesExpenseBy = async ({
  investorId,
  expenseId,
  propertyId,
}: {
  investorId?: string
  expenseId?: string
  propertyId?: string
}) => {
  try {
    if (!investorId && !expenseId && !propertyId)
      throw new HttpError(
        'BAD_REQUEST',
        'You must provide at least one of the following: investorId, expenseId, propertyId'
      )
    const maintenanceExpense = await prisma.maintenanceExpense.findMany({
      where: {
        OR: [
          {
            investorId,
          },
          {
            id: expenseId,
          },
          {
            propertyId,
          },
        ],
      },
    })

    return maintenanceExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const payMaintenanceExpense = async ({
  MExpenseId,
  investorId,
  paid,
}: {
  MExpenseId: string
  investorId: string
  paid: number
}) => {
  try {
    isValidUUID(MExpenseId) && isValidUUID(investorId)
    z.number({
      invalid_type_error: 'Amount must be a number',
      required_error: 'Amount is Required',
    })
      .positive({
        message: 'Amount must be a positive number',
      })
      .parse(paid)

    // check if the maintenanceExpense is related to the investor
    const maintenanceExpense = await prisma.maintenanceExpense.findUniqueOrThrow({
      where: {
        id: MExpenseId,
        investorId,
      },
    })
    if (paid > maintenanceExpense.amount || paid > maintenanceExpense.amount - maintenanceExpense.paid) {
      throw new HttpError(
        'BAD_REQUEST',
        `Paid amount is greater than the total amount (${maintenanceExpense.amount}) paid (${
          maintenanceExpense.paid
        }), the investor should pay ${maintenanceExpense.amount - maintenanceExpense.paid} `
      )
    }
    const updatedExpense = await prisma.maintenanceExpense.update({
      where: {
        investorId,
      },
      data: {
        paid: {
          increment: paid,
        },
      },
    })

    return updatedExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

/* 
=================================================================
                    Custom Expense
=================================================================
*/
// other custom expenses related to the investor
export const createExpense = async (expense: SafeExpense) => {
  try {
    const data = expenseSchema.safeParse(expense)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const newExpense = await prisma.expenses.create({
      data: expense,
    })

    return newExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const getExpensesByInvestorId = async (id: string) => {
  try {
    isValidUUID(id)
    const expenses = await prisma.expenses.findMany({
      where: {
        forInvestorId: id,
      },
    })

    return expenses
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const getExpenseById = async (id: string) => {
  try {
    isValidUUID(id)
    const expense = await prisma.expenses.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return expense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

const handlePaidAmount = async (paid: number, originalExpense: Expenses) => {
  if (paid > originalExpense.amount || paid > originalExpense.amount - originalExpense.paid) {
    throw new HttpError(
      'BAD_REQUEST',
      `Paid amount is greater than the total amount (${originalExpense.amount}) paid (${
        originalExpense.paid
      }), the investor should pay ${originalExpense.amount - originalExpense.paid} `
    )
  }
  // partial payment or full payment
  await prisma.expenses.update({
    where: {
      id: originalExpense.id,
    },
    data: {
      paid: {
        increment: paid,
      },
    },
  })
}

export const updateExpense = async (updatedValues: Partial<SafeExpense> & { id: string }) => {
  try {
    const { paid, ...expense } = updatedValues
    isValidUUID(expense.id)
    const data = expenseSchema.partial().safeParse(expense)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const originalExpense = await prisma.expenses.findUniqueOrThrow({
      where: {
        id: expense.id,
      },
    })
    if (paid) {
      await handlePaidAmount(paid, originalExpense)
    }
    const updatedExpense = await prisma.expenses.update({
      where: {
        id: expense.id,
      },
      data: expense,
    })

    return updatedExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const deleteExpense = async (id: string, hard = false) => {
  try {
    isValidUUID(id)
    if (hard) {
      await prisma.expenses.delete({
        where: {
          id,
        },
      })
    } else {
      await prisma.expenses.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      })
    }
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
