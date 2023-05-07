import { z } from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { enhanceZodErrorMessage } from '../util/enhanceZodErrorMessage'
import { handleAsyncError } from '../util/handleAsyncError'
import { SafeAgent, UUID, agentSchema } from '../util/shared/schema'
import { isValidUUID } from '../util/validateUUID'

/**
 *
 * The Agent resource is linked to the Investor resource.
 * The Agent handles the communication between investor and the company.
 * The investor changes the agent frequently. The agent is not deleted, but soft deleted from the investor (business requirement).
 */

export const createAgent = async (agent: SafeAgent) => {
  try {
    const data = agentSchema.safeParse(agent)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${errors}`)
    }
    // soft delete the old agent (this is a business rule)
    await prisma.agent.updateMany({
      where: {
        investorId: agent.investorId,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    const newAgent = await prisma.agent.create({
      data: agent,
    })
    return newAgent
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const getAgentById = async (id: string) => {
  try {
    isValidUUID(id)
    const agent = await prisma.agent.findUnique({
      where: {
        id,
      },
    })
    return agent
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
export const getAgentsByInvestorId = async (investorId: string) => {
  try {
    isValidUUID(investorId)
    const agent = await prisma.agent.findMany({
      where: {
        investorId,
      },
    })
    return agent
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
/** soft Delete Agent */
export const unlinkAgentFromInvestor = async (agentId: string) => {
  try {
    isValidUUID(agentId)
    // soft delete the agent (this is a business rule)
    const updatedAgent = await prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    return updatedAgent
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const linkAgentToInvestor = async (agentId: string, investorId: string) => {
  try {
    const data = z
      .object({
        agentId: UUID,
        investorId: UUID,
      })
      .safeParse({ agentId, investorId })
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${errors.join(', ')}`)
    }
    const updatedInvestor = await prisma.investor.update({
      where: {
        id: investorId,
      },
      data: {
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    })
    return updatedInvestor
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
