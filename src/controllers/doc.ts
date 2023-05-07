/* eslint-disable import/order */
import { Docs } from '@prisma/client'
import crypto from 'crypto'
import { UploadedFile } from 'express-fileupload'
import fs from 'fs'
import { extname, join } from 'path'
import pdfThumbnail from 'pdf-thumbnail'
import prisma from '../db'
import { handleAsyncError } from '../util/handleAsyncError'

export const uploadDocs = async (Docs: UploadedFile[]) => {
  try {
    const uploadedDocs: Docs[] = []
    fs.existsSync(join(__dirname, '../../uploads')) ? null : fs.mkdirSync(join(__dirname, '../../uploads'))
    fs.existsSync(join(__dirname, '../../uploads/docs')) ? null : fs.mkdirSync(join(__dirname, '../../uploads/docs'))
    fs.existsSync(join(__dirname, '../../uploads/thumbnails'))
      ? null
      : fs.mkdirSync(join(__dirname, '../../uploads/thumbnails'))

    for await (const file of Docs) {
      const name = file.name
      const ext = extname(file.name)
      file.name = `${crypto.randomUUID().toString()}`
      const type = file.mimetype.split('/')[0]
      const path = join(__dirname, `../../uploads/${type === 'image' ? 'images/' : 'docs/'}`)

      const thumbnailPath = join(__dirname, `../../uploads/thumbnails/${file.name}.png`)
      const thumbnail =
        type === 'application'
          ? await pdfThumbnail(file.data, {
              compress: {
                quality: 100,
              },
            })
          : null

      if (thumbnail) {
        const writeStream = fs.createWriteStream(thumbnailPath)
        thumbnail.pipe(writeStream)
      }
      file.mv(path + file.name + ext)
      const document = await prisma.docs.create({
        data: {
          name,
          type: type === 'image' ? type : 'doc',
          url: `/docs/${file.name}${ext}`,
          id: file.name,
          thumbnail: thumbnail ? `/thumbnails/${file.name}` : null,
        },
      })
      uploadedDocs.push(document)
    }
    return uploadedDocs
  } catch (error) {
    handleAsyncError(error)
  }
}

export const deleteDocs = async (Docs: Docs[]) => {
  try {
    for await (const file of Docs) {
      fs.unlinkSync(file.url)
      if (file.thumbnail) {
        fs.unlinkSync(file.thumbnail)
      }
    }
  } catch (error) {
    handleAsyncError(error)
  }
}

export const deleteFile = async (file: Docs) => {
  try {
    fs.unlinkSync(file.url)
    if (file.thumbnail) {
      fs.unlinkSync(file.thumbnail)
    }
  } catch (error) {
    handleAsyncError(error)
  }
}

export const getDocs = async (page = 1) => {
  try {
    const Docs = await prisma.docs.findMany({
      skip: (page - 1) * 10,
      take: 30,
    })
    return Docs
  } catch (error) {
    handleAsyncError(error)
  }
}

export const getDoc = async (id: string) => {
  try {
    const doc = await prisma.docs.findUniqueOrThrow({
      where: {
        id,
      },
    })
    return doc
  } catch (error) {
    handleAsyncError(error)
  }
}
