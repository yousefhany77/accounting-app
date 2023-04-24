import z from 'zod'
import { config } from '../../config'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { enhanceZodErrorMessage } from '../util/enhanceZodErrorMessage'
import { handleAsyncError } from '../util/handleAsyncError'
import { SafeProperty, UUID, propertySchema } from '../util/shared/schema'
import { isValidUUID } from '../util/validateUUID'

/*
 * Property is the main entity in the system, it's the main thing that the investor buys.
 * All the properties already exist (built) in the real world. So we can't delete them we will need a loader XD
 */

export const createProperty = async (property: SafeProperty) => {
  try {
    const data = propertySchema.safeParse(property)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const newProperty = await prisma.property.create({
      data: {
        ...property,
        MaintenanceExpense: {
          create: {
            amount: property.area * config.maintenanceExpenseRatePerMeter,
          },
        },
      },
    })

    return newProperty
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const updateProperty = async (id: string, updatedValues: Partial<SafeProperty>) => {
  try {
    const data = propertySchema.partial().safeParse(updatedValues)
    isValidUUID(id)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${Object.values(errors).join(', ')}`)
    }
    const property = await prisma.property.update({
      where: {
        id,
      },
      data: updatedValues,
    })
    return property
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const getProperty = async (id: string) => {
  try {
    isValidUUID(id)
    const property = await prisma.property.findUnique({
      where: {
        id,
      },
      include: {
        investor: {
          select: {
            name: true,
            code: true,
            id: true,
          },
        },
        _count: true,
        MaintenanceExpense: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    })
    return property
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const buyProperty = async (propertyId: string, investorId: string) => {
  try {
    const data = z
      .object({
        propertyId: UUID,
        investorId: UUID,
      })
      .safeParse({ propertyId, investorId })
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${errors.join(', ')}`)
    }

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        investorId,
        MaintenanceExpense: {
          connect: {
            propertyId,
          },
        },
      },
      include: {
        _count: true,
        MaintenanceExpense: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    })
    return property
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}

export const sellProperty = async (id: string, investorId?: string) => {
  try {
    isValidUUID(id)
    const property = await prisma.property.update({
      where: {
        id,
      },
      data: {
        investorId: investorId || null,
        MaintenanceExpense: {
          update: {
            investorId: null,
          },
        },
      },
    })
    return property
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
