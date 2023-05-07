import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import {
  createInvestor,
  deleteInvestor,
  getAllInvestorsPaginated,
  getInvestorById,
  updateInvestor,
} from '../controllers/investor'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

const investorsRouter = Router()

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
      const includeDeleted = req.query.deleted === 'true'
      const investors = await getAllInvestorsPaginated(page, includeDeleted)
      res.status(200).json(investors)
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
      res.status(200).json(investors)
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { investorId } = req.body
      const investor = await updateInvestor(investorId, { deletedAt: null })
      res.status(200).json(investor)
    })
  )
  .all(handleMethodNotAllowed)

investorsRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const userId = req.user?.userId
      const investor = await createInvestor({
        ...req.body,
        updatedBy: userId,
      })
      res.status(201).json(investor)
    })
  )
  .all(handleMethodNotAllowed)

investorsRouter
  .route('/:investorId')
  .get(
    asyncHandler(async (req, res) => {
      const { investorId } = req.params

      const investor = await getInvestorById(investorId.toString())
      res.status(200).json(investor)
    })
  )
  .patch(
    asyncHandler(async (req, res) => {
      const { investorId } = req.params
      const investor = await updateInvestor(investorId, req.body)
      res.status(200).json(investor)
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      // Delete an investor, if hard is true, the investor will be deleted permanently. Otherwise, it will be soft deleted
      const { investorId } = req.params
      const { hard } = req.query as { hard?: boolean }
      const investor = await deleteInvestor(investorId, hard)
      res.status(200).json(investor)
    })
  )
  .all(handleMethodNotAllowed)

export default investorsRouter
