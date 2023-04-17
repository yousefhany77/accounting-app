import express from 'express'
import asyncHandler from 'express-async-handler'
import {
  SafeInvestor,
  createInvestor,
  deleteInvestor,
  getAllInvestorsPaginated,
  getInvestorById,
  updateInvestor,
} from '../controllers/investor'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

const investorsRouter = express.Router()

/**
 * This is the router for the investor resource.
 * The input data is validated using zod on the controller level.
 * The output data is prisma's Investor type. and _count is the total number of related relations. eg. _count: { Expenses: 1 }
 * The deletedAt field is used to soft delete an investor. If the value is null, the investor is not deleted.
 */

// Get all investors
investorsRouter
  .route('/list')
  .get(
    asyncHandler(async (req, res) => {
      const page = Number(req.query.page) || 1
      const investors = await getAllInvestorsPaginated(page)
      res.status(200).json({ investors })
    })
  )
  .all(handleMethodNotAllowed)

// Get the deleted investors
investorsRouter
  .route('/recover')
  .get(
    asyncHandler(async (req, res) => {
      const page = Number(req.query.page) || 1
      const investors = await getAllInvestorsPaginated(page, true)
      res.status(200).json({ investors })
    })
  )
  .all(handleMethodNotAllowed)

investorsRouter
  .route('/:investorId')
  .get(
    asyncHandler(async (req, res) => {
      const { investorId } = req.params

      const investor = await getInvestorById(investorId.toString())
      res.status(200).json({ investor })
    })
  )
  .all(handleMethodNotAllowed)

investorsRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const { email, maintenanceExpenseId, name, updatedBy, code, phone } = req.body as SafeInvestor
      const investor = await createInvestor({ email, maintenanceExpenseId, name, updatedBy, code, phone })
      res.status(201).json({ investor })
    })
  )
  .all(handleMethodNotAllowed)

investorsRouter
  .route('/update/:investorId')
  .patch(
    asyncHandler(async (req, res) => {
      const { investorId } = req.params
      const { email, maintenanceExpenseId, name, updatedBy, code, phone, deletedAt } = req.body as SafeInvestor
      const investor = await updateInvestor(investorId, {
        email,
        maintenanceExpenseId,
        name,
        updatedBy,
        code,
        phone,
        deletedAt,
      })
      res.status(200).json({ investor })
    })
  )
  .all(handleMethodNotAllowed)

// Delete an investor, if hard is true, the investor will be deleted permanently. Otherwise, it will be soft deleted
investorsRouter
  .route('/delete/:investorId')
  .delete(
    asyncHandler(async (req, res) => {
      const { investorId } = req.params
      const { hard } = req.query as { hard?: boolean }
      const investor = await deleteInvestor(investorId, hard)
      res.status(200).json({ investor })
    })
  )
  .all(handleMethodNotAllowed)

export default investorsRouter
