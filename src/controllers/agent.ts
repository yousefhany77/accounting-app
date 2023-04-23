import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { handleAsyncError } from '../util/handleAsyncError'
import { SafeAgent, agentSchema } from '../util/shared/schema'
import { isValidUUID } from '../util/validateUUID'

export const createAgent = async (agent: SafeAgent) => {
  try {
    const data = agentSchema.safeParse(agent)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
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

export const unlinkAgentFromInvestor = async (agentId: string) => {
  try {
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

export const linkAgentToInvestor = async (agentId: string, Investor: string) => {
  try {
    isValidUUID(agentId) && isValidUUID(Investor)
    const updatedInvestor = await prisma.investor.update({
      where: {
        id: Investor,
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
