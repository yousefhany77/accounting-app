import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import {
  Filters,
  aggregateInvestments,
  createInvestment,
  deleteInvestment,
  earlyRedeemInvestment,
  getAllInvestments,
  getInvestmentById,
  updateInvestment,
} from '../controllers/investment'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

export const investmentsRouter = Router()

investmentsRouter
  .route('/list')
  .get(
    asyncHandler(async (req, res) => {
      const filter = req.query as Filters
      filter.startDate = filter?.startDate && new Date(filter.startDate)
      filter.endDate = filter?.endDate && new Date(filter.endDate)
      const investments = await getAllInvestments(filter)
      res.status(200).json(investments)
    })
  )
  .all(handleMethodNotAllowed)

investmentsRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const userId = req.user?.userId
      const investment = await createInvestment({
        ...req.body,
        redemptionDate: new Date(req.body.redemptionDate),
        createdById: userId,
        redeemed: false,
      })
      res.status(201).json(investment)
    })
  )
  .all(handleMethodNotAllowed)

// early redeem investment
investmentsRouter
  .route('/redeem/:investmentId')
  .patch(
    asyncHandler(async (req, res) => {
      const investment = await earlyRedeemInvestment({
        investmentId: req.params.investmentId,
        valueOnMaturity: req.body.valueOnMaturity,
      })
      res.status(200).json(investment)
    })
  )
  .all(handleMethodNotAllowed)

investmentsRouter
  .route('/aggregate')
  .get(
    asyncHandler(async (req, res) => {
      const { startDate, endDate, ...rest } = req.query as Filters
      const aggregate = await aggregateInvestments({
        startDate: startDate && new Date(startDate),
        endDate: endDate && new Date(endDate),
        ...rest,
      })
      res.status(200).json(aggregate)
    })
  )
  .all(handleMethodNotAllowed)

investmentsRouter
  .route('/:investmentId')
  .get(
    asyncHandler(async (req, res) => {
      const investment = await getInvestmentById(req.params.investmentId)
      res.status(200).json(investment)
    })
  )
  .put(
    asyncHandler(async (req, res) => {
      const investment = await updateInvestment(req.params.investmentId, {
        ...req.body,
        redemptionDate: new Date(req.body.redemptionDate),
        createdById: req.user?.userId,
      })
      res.status(200).json(investment)
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const investment = await deleteInvestment(req.params.investmentId)
      res.status(200).json(investment)
    })
  )
  .all(handleMethodNotAllowed)
