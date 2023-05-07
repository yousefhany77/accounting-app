/* eslint-disable import/order */
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import fileUpload from 'express-fileupload'
import path from 'path'
import { getDoc, getDocs, uploadDocs } from '../controllers/doc'
import { HttpError } from '../middleware/errorHandler'
import { fileExtLimiter, fileSizeLimiter } from '../middleware/fileMiddlewares'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'

export const docsRouter = Router()

docsRouter
  .route('/upload')
  .post(
    fileUpload({
      createParentPath: true,
      uriDecodeFileNames: true,
      preserveExtension: true,
    }),
    fileSizeLimiter,
    fileExtLimiter(['png', 'jpg', 'jpeg', 'pdf']),
    asyncHandler(async (req, res) => {
      if (!req.files) {
        throw new HttpError('BAD_REQUEST', 'No file uploaded')
      }
      const files = Object.values(req.files) as fileUpload.UploadedFile[]
      const doc = await uploadDocs(files)
      res.status(201).json(doc)
    })
  )
  .all(handleMethodNotAllowed)

docsRouter
  .route('/list')
  .get(
    asyncHandler(async (req, res) => {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const docs = await getDocs(page)
      res.status(200).json(docs)
    })
  )
  .all(handleMethodNotAllowed)

docsRouter
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      const docData = await getDoc(req.params.id)
      if (!docData) {
        throw new HttpError('NOT_FOUND', 'Document not found')
      }
      const filePath = path.join(__dirname, `../../uploads/${docData.url}`)
      res.sendFile(filePath)
    })
  )
  .all(handleMethodNotAllowed)
