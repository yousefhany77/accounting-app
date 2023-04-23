import { Expenses, MaintenanceExpense } from '@prisma/client'
import z from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { handleAsyncError } from '../util/handleAsyncError'
import { UUID, expenseSchema } from '../util/shared/schema'
import { OmitMultiple } from '../util/types'
import { isValidUUID } from '../util/validateUUID'

export type SafeExpense = OmitMultiple<Expenses, 'createdAt' | 'id' | 'updatedAt' | 'deletedAt'>
export type SafeExpenseSchema = z.ZodType<SafeExpense>

export type SafeMaintenanceExpense = OmitMultiple<MaintenanceExpense, 'createdAt' | 'id' | 'updatedAt' | 'deletedAt'>

/* 
=================================================================
                    Maintenance Expense
This is the yearly expense that the investor pays to the company when he buys a property and it's mandatory
the value of the expense is calculated by the (area * custom_rate) and it's not related to the property price (auto created on property creation).
the link and unlink will be automatically done when the investor buys or sells a property
it can't be deleted  
=================================================================
**/

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
    const filtersSchema = z
      .object({
        investorId: UUID,
        expenseId: UUID,
        propertyId: UUID,
      })
      .partial()
    const data = filtersSchema.safeParse({
      investorId,
      expenseId,
      propertyId,
    })
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
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
    const data = z
      .number({
        invalid_type_error: 'Amount must be a number',
        required_error: 'Amount is Required',
      })
      .positive({
        message: 'Amount must be a positive number',
      })
      .safeParse(paid)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
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
export const getAllExpenseBy = async ({ investorId, expenseId }: { investorId?: string; expenseId?: string }) => {
  try {
    const data = z
      .object({
        investorId: UUID,
        expenseId: UUID,
      })
      .partial()
      .safeParse({ investorId, expenseId })
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const expense = await prisma.expenses.findMany({
      where: {
        OR: [
          {
            forInvestorId: investorId,
          },
          {
            id: expenseId,
          },
        ],
      },
    })

    return expense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
const validatePaidAmount = async (paid: number, originalExpense: Expenses) => {
  if (paid > originalExpense.amount || paid > originalExpense.amount - originalExpense.paid) {
    throw new HttpError(
      'BAD_REQUEST',
      `Paid amount is greater than the total amount (${originalExpense.amount}) paid (${
        originalExpense.paid
      }), the investor should pay ${originalExpense.amount - originalExpense.paid} `
    )
  }
  // partial payment or full payment
  const exp = await prisma.expenses.update({
    where: {
      id: originalExpense.id,
    },
    data: {
      paid: {
        increment: paid,
      },
    },
  })
  return exp
}

export const updateExpense = async (updatedValues: Partial<Omit<SafeExpense, 'paid'>> & { id: string }) => {
  const { id, ...rest } = updatedValues
  try {
    isValidUUID(id)
    const data = expenseSchema.partial().safeParse(updatedValues)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }

    const updatedExpense = await prisma.expenses.update({
      where: {
        id: id,
      },
      data: rest,
    })

    return updatedExpense
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
export const payCustomExpense = async ({ expenseId, paidAmount }: { expenseId: string; paidAmount: number }) => {
  try {
    isValidUUID(expenseId)
    const data = z
      .number({
        invalid_type_error: 'paidAmount must be a number',
        required_error: 'paidAmount is Required',
      })
      .positive({
        message: 'paidAmount must be a positive number',
      })
      .safeParse(paidAmount)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const originalExpense = await prisma.expenses.findUniqueOrThrow({
      where: {
        id: expenseId,
      },
    })
    const exp = await validatePaidAmount(paidAmount, originalExpense)
    return exp
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
