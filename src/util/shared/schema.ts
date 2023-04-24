import { Agent, Property } from '@prisma/client'
import z from 'zod'
import { SafeExpenseSchema, SafeMaintenanceExpense } from '../../controllers/expense'
import { SafeInvestor } from '../../controllers/investor'
import { OmitMultiple } from '../types'

/** Bank Data Zod Schema */
export const BankDataSchema = z.object({
  bankName: z
    .string({
      invalid_type_error: 'Bank Name must be a string',
      required_error: 'Bank Name is Required',
    })
    .min(2)
    .max(255),
  accountNumber: z
    .string({
      invalid_type_error: 'Account Number must be a string',
      required_error: 'Account Number is Required',
    })
    .min(2)
    .max(255),
})

/** Document Zod Schema */
export const DocsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),

  Expenses: z.string().nullish(),
  expensesId: z.string().nullish(),
  MaintenanceExpense: z.string().nullish(),
  maintenanceExpenseId: z.string().nullish(),
  Investment: z.string().nullish(),
  investmentId: z.string().nullish(),
  Property: z.string().nullish(),
  propertyId: z.string().nullish(),
  Agent: z.string().nullish(),
  agentId: z.string().nullish(),
})

/** UUID ZOD Schema */
export const UUID = z
  .string({
    invalid_type_error: 'Id must be a UUID',
    required_error: 'Id is Required',
  })
  .uuid({
    message: 'Id must be a valid UUID',
  })

/** maintenanceExpense Zod Schema */
export const maintenanceExpenseSchema = z.object({
  amount: z
    .number({
      invalid_type_error: 'Expense Amount must be a number',
      required_error: 'Expense Amount is Required',
    })
    .positive({
      message: 'Expense Amount must be a positive number',
    })
    .min(1, {
      message: 'Expense Amount must be greater than 0',
    }),
  paid: z
    .number({
      invalid_type_error: 'Expense Paid must be a Number',
      required_error: 'Expense Paid is Required',
    })
    .positive({
      message: 'Expense Paid must be a positive number',
    })
    .min(1, {
      message: 'Expense Paid must be greater than 0',
    }),
  propertyId: UUID,
  investorId: UUID.nullable(),
}) satisfies z.ZodType<SafeMaintenanceExpense>

/** Expense Zod Schema */
export const expenseSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Expense Name must be a string',
      required_error: 'Expense Name is Required',
    })
    .min(2),

  amount: z
    .number({
      invalid_type_error: 'Expense Amount must be a number',
      required_error: 'Expense Amount is Required',
    })
    .positive({
      message: 'Expense Amount must be a positive number',
    })
    .min(1, {
      message: 'Expense Amount must be greater than 0',
    }),
  paid: z
    .number({
      invalid_type_error: 'Expense Paid must be a Number',
      required_error: 'Expense Paid is Required',
    })
    .positive({
      message: 'Expense Paid must be a positive number',
    })
    .min(1, {
      message: 'Expense Paid must be greater than 0',
    }),
  forInvestorId: z
    .string({
      invalid_type_error: 'Expense Investor Id must be a UUID',
      required_error: 'Investor Id is Required',
    })
    .uuid({
      message: 'Investor Id must be a valid UUID',
    }),
}) satisfies SafeExpenseSchema

type SafeInvestorSchema = z.ZodType<SafeInvestor>
/** Investor Zod Schema */
export const investorSchema = z.object({
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
    .string({
      required_error: 'Phone is Required',
      invalid_type_error: 'Phone not valid',
    })
    .min(10, {
      message: 'Number must be at least 10 digits',
    })
    .max(12, {
      message: 'Number must be less than 12 digits',
    }),
  deletedAt: z.date().nullish(),
  bank: z
    .array(BankDataSchema, {
      invalid_type_error: 'Bank data must be in array',
      required_error: 'Bank is Required',
    })
    .min(1, {
      message: 'Bank must have at least one entry',
    }),
  address: z
    .string({
      invalid_type_error: 'Address must be a string',
      required_error: 'Address is Required',
    })
    .min(2)
    .max(255),
}) satisfies SafeInvestorSchema

export type SafeProperty = OmitMultiple<
  Property,
  'updatedAt' | 'createdAt' | 'deletedAt' | 'id' | 'investorId' | 'elevators'
> & {
  elevators?: string[]
}
type SafePropertySchema = z.ZodType<SafeProperty>
/** Property Zod Schema */
export const propertySchema = z.object({
  latinName: z
    .string({
      invalid_type_error: 'Latin Name must be a string',
      required_error: 'Latin Name is Required',
    })
    .min(2)
    .max(255),
  digitalName: z.number({
    invalid_type_error: 'Digital Name must be a number',
    required_error: 'Digital Name is Required',
  }),
  floor: z.number({
    invalid_type_error: 'Floor must be a number',
    required_error: 'Floor is Required',
  }),
  area: z
    .number({
      invalid_type_error: 'Area must be a number',
      required_error: 'Area is Required',
    })
    .min(1, {
      message: 'Area must be greater than 0',
    }),
  direction: z.string({
    invalid_type_error: 'Direction must be a string',
    required_error: 'Direction is Required',
  }),
  elevators: z
    .string({
      invalid_type_error: 'Elevators must be a string',
    })
    .array()
    .optional(),
}) satisfies SafePropertySchema

export type SafeAgent = OmitMultiple<Agent, 'updatedAt' | 'createdAt' | 'deletedAt' | 'id'>
type SafeAgentSchema = z.ZodType<SafeAgent>

/** Agent Zod Schema */
export const agentSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      required_error: 'Name is Required',
    })
    .min(2)
    .max(255),
  phone: z
    .string()
    .min(10, {
      message: 'Number must be at least 10 digits',
    })
    .max(12, {
      message: 'Number must be less than 12 digits',
    }),
  address: z
    .string({
      invalid_type_error: 'Address must be a string',
      required_error: 'Address is Required',
    })
    .min(2)
    .max(255),
  investorId: UUID,
}) satisfies SafeAgentSchema
