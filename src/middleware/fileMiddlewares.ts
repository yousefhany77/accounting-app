import { NextFunction, Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'
// eslint-disable-next-line import/order
import { extname } from 'path'
import { HttpError } from './errorHandler'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const fileSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    return next(new HttpError('BAD_REQUEST', 'No files attached'))
  }
  const files = req.files as { [fieldname: string]: UploadedFile }

  const filesOverTheLimit: string[] = []
  Object.values(files).forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      filesOverTheLimit.push(file.name)
    }
  })
  if (filesOverTheLimit.length) {
    return res.status(413).json({
      message: `File ${JSON.stringify(
        filesOverTheLimit
      )} size limit exceeded. Maximum file size allowed is ${MAX_FILE_SIZE} bytes`,
    })
  }
  next()
}

export const fileExtLimiter = (allowedExtArray: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: UploadedFile }

    const fileExtensions: string[] = []
    Object.values(files).forEach((file) => {
      fileExtensions.push(extname(file.name).split('.')[1])
    })

    // Are the file extension allowed?
    const allowed = fileExtensions.every((ext) => allowedExtArray.includes(ext))

    if (!allowed) {
      const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(',', ', ')

      return res.status(422).json({ status: 'error', message })
    }

    next()
  }
}
