import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import {
  createAgent,
  getAgentById,
  getAgentsByInvestorId,
  linkAgentToInvestor,
  unlinkAgentFromInvestor,
} from '../controllers/agent'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

export const agentRouter = Router()

agentRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const createdAgent = await createAgent(req.body)
      res.status(201).json(createdAgent)
    })
  )
  .all(handleMethodNotAllowed)

agentRouter
  .route('/investor/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const agents = await getAgentsByInvestorId(id)
      res.status(200).json(agents)
    })
  )
  .all(handleMethodNotAllowed)

agentRouter
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const agent = await getAgentById(id)
      res.status(200).json(agent)
    })
  )
  .all(handleMethodNotAllowed)

agentRouter
  .route('/link/:id')
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const { investorId } = req.body
      const updatedAgent = await linkAgentToInvestor(id, investorId)
      res.status(200).json(updatedAgent)
    })
  )
  .all(handleMethodNotAllowed)

agentRouter
  .route('/unlink/:id')
  .patch(
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const updatedAgent = await unlinkAgentFromInvestor(id)
      res.status(200).json(updatedAgent)
    })
  )
  .all(handleMethodNotAllowed)
