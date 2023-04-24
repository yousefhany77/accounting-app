import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import z from 'zod'
import {
  SafeExpense,
  createExpense,
  deleteExpense,
  getAllExpenseBy,
  getAllMaintenancesExpenseBy,
  getExpenseById,
  getMaintenancesExpenseById,
  payCustomExpense,
  payMaintenanceExpense,
  updateExpense,
} from '../controllers/expense'
import { HttpError } from '../middleware/errorHandler'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

/**
 * This is the router for the expenses resource.
 * The input data is validated using zod on the controller level.
 * The deletedAt field is used to soft delete an expenses. If the value is null, the expenses is not deleted.
 */

export const expensesRouter = Router()

/** =======================================
 *          Maintenance Expenses
 * ======================================= */
expensesRouter
  .route('/maintenance/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const expense = await getMaintenancesExpenseById(id)
      res.status(200).json(expense)
    })
  )
  .all(handleMethodNotAllowed)

expensesRouter
  .route('/maintenance/pay')
  .post(
    asyncHandler(async (req, res) => {
      const { expense } = req.body as {
        expense: {
          MExpenseId: string
          investorId: string
          paid: number
        }
        doc: File
      }
      const exp = await payMaintenanceExpense(expense)
      // Todo: upload a new Document to the file system and link it to the expense
      res.status(200).json(exp)
    })
  )
  .all(handleMethodNotAllowed)
/** =======================================
 *          Custom Expenses
 * ======================================= */

expensesRouter
  .route('/custom/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const expense = await getExpenseById(id)
      res.status(200).json(expense)
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const updated = await updateExpense({
        id,
        ...req.body,
      })
      res.status(200).json(updated)
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const deleted = await deleteExpense(id, req.body.hardDelete)
      res.status(200).json(deleted)
    })
  )
  .all(handleMethodNotAllowed)

expensesRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const { name, amount, paid, forInvestorId } = req.body as SafeExpense
      const expense = await createExpense({ name, amount, paid, forInvestorId })
      res.status(201).json(expense)
    })
  )
  .all(handleMethodNotAllowed)

expensesRouter
  .route('/custom/pay')
  .post(
    asyncHandler(async (req, res) => {
      const { expense } = req.body as {
        expense: {
          expenseId: string
          paidAmount: number
        }
        doc: File
      }
      // payment is implemented as an update
      const exp = await payCustomExpense(expense)
      // Todo: upload a new Document to the file system and link it to the expense
      res.status(200).json(exp)
    })
  )
  .all(handleMethodNotAllowed)

/** =======================================
 * Custom & Maintenance Expenses (shared)
 * ======================================= */

expensesRouter
  .route('/list')
  .get(
    asyncHandler(async (req, res) => {
      const type = z.enum(['maintenance', 'custom']).parse(req.query.type)
      switch (type) {
        case 'maintenance':
          const maintenanceExpenses = await getAllMaintenancesExpenseBy(req.body)
          res.status(200).json(maintenanceExpenses)
        case 'custom':
          const customExpenses = await getAllExpenseBy(req.body)
          res.status(200).json(customExpenses)
        default:
          throw new HttpError('BAD_REQUEST', "Invalid type. It must be 'maintenance' or 'custom'")
      }
    })
  )
  .all(handleMethodNotAllowed)

expensesRouter
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const type = z.enum(['maintenance', 'custom']).parse(req.query.type)
      switch (type) {
        case 'maintenance':
          const maintenanceExpense = await getMaintenancesExpenseById(req.body)
          res.status(200).json(maintenanceExpense)
        case 'custom':
          const customExpense = await getExpenseById(req.body)
          res.status(200).json(customExpense)
        default:
          throw new HttpError('BAD_REQUEST', "Invalid type. It must be 'maintenance' or 'custom'")
      }
    })
  )
  .all(handleMethodNotAllowed)

expensesRouter.route('/').all(handleMethodNotAllowed)
