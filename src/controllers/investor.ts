import { Investor } from '@prisma/client'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { enhanceInvestments } from '../util/enhanceInvestments'
import { enhanceZodErrorMessage } from '../util/enhanceZodErrorMessage'
import { handleAsyncError } from '../util/handleAsyncError'
import { investorSchema } from '../util/shared/schema'
import { OmitMultiple } from '../util/types'
import { isValidUUID } from '../util/validateUUID'

export type SafeInvestor = OmitMultiple<Investor, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  /** use the DeletedAt if the value is null then the investor is not deleted it will be fetched with the rest of investors  */
  deletedAt?: Date | null
}

export const getInvestorById = async (id: string) => {
  try {
    isValidUUID(id)
    const investor = await prisma.investor.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        _count: true,
        agent: {
          orderBy: {
            deletedAt: 'asc',
          },
        },
        investments: true,
      },
    })
    investor.investments = enhanceInvestments(investor.investments)
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
        ...(deleted ? {} : { deletedAt: null }),
      },
      orderBy: {
        code: 'asc',
      },

      include: {
        investments: true,
        agent: true,
      },
    })
    return investors.map((investor) => {
      const { investments, ...rest } = investor
      const sumROI = enhanceInvestments(investments).reduce((acc, curr) => {
        return acc + curr.ROI
      }, 0)
      const ROI = sumROI / investments.length
      return {
        ...rest,
        ROI,
        investmentsCount: investments.length,
      }
    })
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const createInvestor = async (investor: SafeInvestor) => {
  try {
    const data = investorSchema.safeParse(investor)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)

      if (data.error.flatten().fieldErrors.updatedBy) {
        throw new HttpError('UNAUTHORIZED', `You are not authorized to create an investor`)
      }
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }

    const createdInvestor = await prisma.investor.create({
      data: investor,
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
      const errors = enhanceZodErrorMessage(data.error)
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
