import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { buyProperty, createProperty, sellProperty, updateProperty } from '../controllers/property'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

const propertyRouter = Router()

propertyRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const newProperty = await createProperty(req.body)
      res.status(201).json({ newProperty })
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/update/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const updated = await updateProperty(propertyId, req.body)
      res.status(200).json({ updated })
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/buy/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const property = await buyProperty(propertyId, req.body.investorId)
      res.status(200).json({ property })
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/sell/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const property = await sellProperty(propertyId, req.body.investorId)
      res.status(200).json({ property })
    })
  )
  .all(handleMethodNotAllowed)
