import { InvestmentType } from '@prisma/client'
import z from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { enhanceInvestments } from '../util/enhanceInvestments'
import { enhanceZodErrorMessage } from '../util/enhanceZodErrorMessage'
import { handleAsyncError } from '../util/handleAsyncError'
import { SafeInvestment, investmentSchema } from '../util/shared/schema'
import { isValidUUID } from '../util/validateUUID'

export type Filters = {
  startDate?: Date
  endDate?: Date
  type?: InvestmentType
  investorId?: string
  withInvestor?: boolean
  dateFilterType?: 'createdAt' | 'redemptionDate'
}
// create a new investment
export const createInvestment = async (investment: SafeInvestment) => {
  try {
    const data = investmentSchema.safeParse(investment)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    if (investment.amount * (1 + investment.interestRate) < investment.valueOnMaturity) {
      throw new HttpError(
        'BAD_REQUEST',
        `Value on maturity cannot be more than ${investment.amount * (1 + investment.interestRate)}`
      )
    }
    const oldInvestment = await prisma.investment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        investorId: investment.investorId,
        redeemed: false,
        deletedAt: null,
      },
    })
    const { balance } = await prisma.investor.findUniqueOrThrow({
      where: {
        id: investment.investorId,
      },
      select: {
        balance: true,
      },
    })
    investment.redemptionDate = new Date(investment.redemptionDate.setHours(0, 0, 0, 0))
    if (oldInvestment._sum.amount && oldInvestment._sum.amount + investment.amount > balance) {
      throw new HttpError('BAD_REQUEST', 'Investor does not have enough balance')
    }
    const createdInvestment = await prisma.investment.create({
      data: investment,
    })
    return createdInvestment
  } catch (error) {
    handleAsyncError(error)
  }
}

// early redeem an investment
export const earlyRedeemInvestment = async ({
  investmentId,
  valueOnMaturity,
}: {
  investmentId: string
  valueOnMaturity: number
}) => {
  try {
    isValidUUID(investmentId)
    const data = z
      .object({
        valueOnMaturity: z.number().min(0),
      })
      .safeParse({ valueOnMaturity })
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const oldInvestment = await prisma.investment.findUniqueOrThrow({
      where: {
        id: investmentId,
      },
    })
    if (oldInvestment.amount > valueOnMaturity) {
      throw new HttpError('BAD_REQUEST', `Value on maturity cannot be less than ${oldInvestment.amount}`)
    }
    if (oldInvestment.amount * (1 + oldInvestment.interestRate) < valueOnMaturity) {
      throw new HttpError(
        'BAD_REQUEST',
        `Value on maturity cannot be more than ${oldInvestment.amount * (1 + oldInvestment.interestRate)}`
      )
    }
    const investment = await prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: {
        valueOnMaturity,
        redemptionDate: new Date(),
        redeemed: true,
      },
    })
    return investment
  } catch (error) {
    handleAsyncError(error)
  }
}
export const deleteInvestment = async (investmentId: string) => {
  try {
    isValidUUID(investmentId)
    const investment = await prisma.investment.findUniqueOrThrow({
      where: {
        id: investmentId,
      },
    })
    if (investment.redeemed) {
      throw new HttpError('BAD_REQUEST', 'Cannot delete a redeemed investment')
    }
    const deletedInvestment = await prisma.investment.delete({
      where: {
        id: investmentId,
      },
    })
    return deletedInvestment
  } catch (error) {
    handleAsyncError(error)
  }
}

export const updateInvestment = async (investmentId: string, investment: SafeInvestment) => {
  try {
    isValidUUID(investmentId)
    const data = investmentSchema.safeParse(investment)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    if (investment.amount * (1 + investment.interestRate) < investment.valueOnMaturity) {
      throw new HttpError(
        'BAD_REQUEST',
        `Value on maturity cannot be more than ${investment.amount * (1 + investment.interestRate)}`
      )
    }
    const oldInvestment = await prisma.investment.findUniqueOrThrow({
      where: {
        id: investmentId,
      },
    })
    if (oldInvestment.redeemed) {
      throw new HttpError('BAD_REQUEST', 'Cannot update a redeemed investment')
    }
    const updatedInvestment = await prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: investment,
    })
    return updatedInvestment
  } catch (error) {
    handleAsyncError(error)
  }
}

// get all investments without pagination
export const getAllInvestments = async (filter?: Filters) => {
  try {
    const investments = await prisma.investment.findMany({
      where: {
        ...(filter?.dateFilterType === 'createdAt'
          ? {
              createdAt: {
                gte: filter?.startDate,
                lte: filter?.endDate,
              },
            }
          : {
              redemptionDate: {
                gte: filter?.startDate,
                lte: filter?.endDate,
              },
            }),
        type: filter?.type,
        investorId: filter?.investorId,
        deletedAt: null,
      },
      include: {
        ...(filter?.withInvestor
          ? {
              investor: {
                select: {
                  name: true,
                },
              },
            }
          : {
              investor: false,
            }),
      },
    })

    for await (const investment of investments) {
      const redeemDate = investment.redemptionDate
      const currentDate = new Date(new Date().setHours(0, 0, 0, 0))
      if (redeemDate && currentDate >= redeemDate) {
        await prisma.investment.update({
          where: {
            id: investment.id,
          },
          data: {
            redeemed: true,
          },
        })
      }
    }
    return enhanceInvestments(investments)
  } catch (error) {
    handleAsyncError(error)
  }
}

export const getInvestmentById = async (investmentId: string) => {
  try {
    isValidUUID(investmentId)
    const investment = await prisma.investment.findUniqueOrThrow({
      where: {
        id: investmentId,
      },
      include: {
        investor: true,
      },
    })
    const redeemDate = investment.redemptionDate
    const currentDate = new Date(new Date().setHours(0, 0, 0, 0))
    if (redeemDate && currentDate >= redeemDate) {
      const investmentUpdated = await prisma.investment.update({
        where: {
          id: investment.id,
        },
        data: {
          redeemed: true,
        },
      })
      return enhanceInvestments([investmentUpdated])[0]
    }

    return enhanceInvestments([investment])[0]
  } catch (error) {
    handleAsyncError(error)
  }
}

export const aggregateInvestments = async (filter?: Filters) => {
  try {
    const {
      _sum: { balance },
    } = await prisma.investor.aggregate({
      _sum: {
        balance: true,
      },
      where: {
        createdAt: {
          gte: filter?.startDate,
          lte: filter?.endDate,
        },
        id: filter?.investorId,
        deletedAt: null,
      },
    })
    const {
      _sum: { valueOnMaturity, amount },
      _avg: { interestRate },
    } = await prisma.investment.aggregate({
      _sum: {
        amount: true,
        valueOnMaturity: true,
      },
      _avg: {
        interestRate: true,
      },
      where: {
        createdAt: {
          gte: filter?.startDate,
          lte: filter?.endDate,
        },
        deletedAt: null,
        investor: {
          deletedAt: null,
          id: filter?.investorId,
        },
      },
    })
    const avgROI = Number(((valueOnMaturity ?? 0) - (amount ?? 0)) / (amount ?? 0)) * 100
    return {
      totalInvestorsBalance: balance,
      totalProfit: valueOnMaturity && amount ? valueOnMaturity - amount : 0,
      avgInterestRate: (interestRate ?? 0) * 100,
      avgROI,
    }
  } catch (error) {
    handleAsyncError(error)
  }
}
