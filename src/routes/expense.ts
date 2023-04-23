import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { SafeExpense, createExpense } from '../controllers/expense'

export const expensesRouter = Router()

expensesRouter.route('/new').post(
  asyncHandler(async (req, res) => {
    const { name, amount, paid, forInvestorId } = req.body as SafeExpense
    const expense = await createExpense({ name, amount, paid, forInvestorId })
    res.status(201).json({ expense })
  })
)
