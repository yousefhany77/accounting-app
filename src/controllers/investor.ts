import { Investor } from '@prisma/client'
import z from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { handleAsyncError } from '../util/handleAsyncError'
import { OmitMultiple } from '../util/types'

const isValidUUID = (id: string) => {
  const isValidId = z.string().uuid().safeParse(id)
  if (!isValidId.success) {
    throw new HttpError('BAD_REQUEST', isValidId.error.errors.map((e) => e.message).join(', '))
  }
}

export const getInvestorById = async (id: string) => {
  try {
    isValidUUID(id)
    const investor = await prisma.investor.findFirstOrThrow({
      where: {
        id,
      },
    })

    return investor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
/**
 * @param page - Page number
 * @param deleted - If true, returns deleted investors
 */
export const getAllInvestorsPaginated = async (page = 1, deleted = false) => {
  try {
    const investors = await prisma.investor.findMany({
      skip: (page - 1) * 50,
      take: 50,
      where: {
        deletedAt: deleted ? { not: null } : null,
      },
      orderBy: {
        code: 'asc',
      },
      include: {
        _count: true,
      },
    })
    return investors
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export type SafeInvestor = OmitMultiple<Investor, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  /** use the DeletedAt if the value is null then the investor is not deleted it will be fetched with the rest of investors  */
  deletedAt?: Date | null
}

type SafeInvestorSchema = z.ZodType<SafeInvestor>
const investorSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      required_error: 'Name is Required',
    })
    .min(2)
    .max(255),
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
      required_error: 'Email is Required',
    })
    .email({
      message: 'Invalid email',
    }),
  code: z.number({
    invalid_type_error: 'Code must be a number',
    required_error: 'Code is Required',
  }),
  updatedBy: z
    .string({
      invalid_type_error: 'UpdatedBy must be a UUID',
      required_error: 'UpdatedBy is Required',
    })
    .uuid(),
  phone: z
    .string()
    .min(10, {
      message: 'Number must be at least 10 digits',
    })
    .max(12, {
      message: 'Number must be less than 12 digits',
    }),
  deletedAt: z.date().nullish(),
}) satisfies SafeInvestorSchema

export const createInvestor = async (investor: SafeInvestor) => {
  try {
    const data = investorSchema.safeParse(investor)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }

    /*
     * each investor should have a maintenance expense.
     * the value is calculated by the total area of the building multiplied by the maintenance expense rate.
     * we can't make it required in the schema because we can't calc the area without the querying properties the investor own.
     * so we'll create it here.
     * and updated it when the investor update his properties.
     */

    const createdInvestor = await prisma.investor.create({
      data: {
        ...investor,
        maintenanceExpense: {
          create: {
            amount: 0,
          },
        },
      },
    })

    return createdInvestor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const updateInvestor = async (id: string, updatedValues: Partial<SafeInvestor>) => {
  try {
    const data = investorSchema.partial().safeParse(updatedValues)
    isValidUUID(id)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const investor = await prisma.investor.update({
      where: {
        id,
      },
      data: updatedValues,
    })
    return investor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const deleteInvestor = async (id: string, hardDelete = false) => {
  try {
    isValidUUID(id)
    if (hardDelete) {
      const investor = await prisma.investor.delete({
        where: {
          id,
        },
      })
      return investor
    }
    const investor = await prisma.investor.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    return investor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
