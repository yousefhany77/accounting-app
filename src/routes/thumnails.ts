/* eslint-disable import/order */
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import path from 'path'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'
import { isValidUUID } from '../util/validateUUID'

export const thumbnailRouter = Router()

thumbnailRouter
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      isValidUUID(req.params.id)
      const filePath = path.join(__dirname, `../../uploads/thumbnails/${req.params.id}.png`)
      res.sendFile(filePath)
    })
  )
  .all(handleMethodNotAllowed)
