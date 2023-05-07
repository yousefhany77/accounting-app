import { Agent, Investment, InvestmentType } from '@prisma/client'
import z from 'zod'
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
  balance: z.number({
    invalid_type_error: 'Balance must be a number',
    required_error: 'Balance is Required',
  }),
}) satisfies SafeInvestorSchema

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

export type SafeInvestment = OmitMultiple<Investment, 'updatedAt' | 'createdAt' | 'deletedAt' | 'id' | 'bank'> & {
  bank: z.infer<typeof BankDataSchema>
}
type SafeInvestmentSchema = z.ZodType<SafeInvestment>
/** Investment Zod Schema */
export const investmentSchema = z.object({
  type: z.enum([InvestmentType.BONDS, InvestmentType.CERTIFICATES], {
    invalid_type_error: 'Investment Type must be a valid type',
    required_error: 'Investment Type is Required',
  }),
  amount: z
    .number({
      invalid_type_error: 'Investment Amount must be a number',
      required_error: 'Investment Amount is Required',
    })
    .min(1, {
      message: 'Investment Amount must be greater than 0',
    }),
  valueOnMaturity: z
    .number({
      invalid_type_error: 'Investment valueOnMaturity must be a number',
      required_error: 'Investment valueOnMaturity is Required',
    })
    .min(1, {
      message: 'Investment Amount must be greater than 0',
    }),
  interestRate: z
    .number({
      invalid_type_error: 'Investment Interest Rate must be a number',
      required_error: 'Investment Interest Rate is Required',
    })
    .max(1, {
      message: 'Investment Interest Rate must be less than 1',
    })
    .min(0.01, {
      message: 'Investment Interest Rate must be greater than 0.01',
    }),
  redemptionDate: z
    .date({
      invalid_type_error: 'Investment Redemption Date must be a date',
      required_error: 'Investment Redemption Date is Required',
    })
    .min(new Date(), {
      message: 'Investment Redemption Date must be greater than today',
    }),
  bank: BankDataSchema,

  customId: z.string().nullable(),
  investorId: UUID,
  createdById: UUID,
  redeemed: z.boolean().nullable(),
}) satisfies SafeInvestmentSchema
