import { config } from '../../config'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { handleAsyncError } from '../util/handleAsyncError'
import { SafeProperty, propertySchema } from '../util/shared/schema'
import { isValidUUID } from '../util/validateUUID'

/**
 * Property is the main entity in the system, it's the main thing that the investor buys.
 * All the properties already exist (built) in the real world. So we can't delete them we will need a loader XD
 */

export const createProperty = async (property: SafeProperty) => {
  try {
    const data = propertySchema.safeParse(property)
    if (!data.success) {
      const errors = data.error.flatten().fieldErrors
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
      const errors = data.error.flatten().fieldErrors
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

export const buyProperty = async (id: string, investorId: string) => {
  try {
    isValidUUID(id)
    isValidUUID(investorId)
    const property = await prisma.property.update({
      where: {
        id,
      },
      data: {
        investorId,
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
      },
    })
    return property
  } catch (error: unknown) {
    handleAsyncError(error)
  }
}
