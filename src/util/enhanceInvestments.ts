import { Investment } from '@prisma/client'

export const enhanceInvestments = (investments: Investment[]) =>
  investments.map((investment) => {
    const ROI = Number(((investment.valueOnMaturity - investment.amount) / investment.amount) * 100)
    return { ...investment, ROI }
  })
