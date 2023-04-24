import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { buyProperty, createProperty, getProperty, sellProperty, updateProperty } from '../controllers/property'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

export const propertyRouter = Router()

propertyRouter
  .route('/new')
  .post(
    asyncHandler(async (req, res) => {
      const createdProperty = await createProperty(req.body)
      res.status(201).json(createdProperty)
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/:propertyId')
  .get(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const property = await getProperty(propertyId)
      res.status(200).json(property)
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/update/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const updated = await updateProperty(propertyId, req.body)
      res.status(200).json(updated)
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/buy/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const property = await buyProperty(propertyId, req.body.investorId)
      res.status(200).json(property)
    })
  )
  .all(handleMethodNotAllowed)

propertyRouter
  .route('/sell/:propertyId')
  .patch(
    asyncHandler(async (req, res) => {
      const { propertyId } = req.params
      const property = await sellProperty(propertyId, req.body.investorId)
      res.status(200).json(property)
    })
  )
  .all(handleMethodNotAllowed)
