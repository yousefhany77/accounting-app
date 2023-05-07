import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
// eslint-disable-next-line import/order
import { HttpError, errorHandler } from './middleware/errorHandler'
import { handleMethodNotAllowed } from './middleware/handleMethodNotAllowed'
import { withAuth } from './middleware/withAuth'
import { agentRouter } from './routes/agent'
import { authRouter } from './routes/auth'
import { docsRouter } from './routes/doc'
import { investmentsRouter } from './routes/investments'
import investorsRouter from './routes/investor'
import { thumbnailRouter } from './routes/thumnails'
import { validateEnv } from './util/validateEnv'

config()
const { Frontend_URL } = validateEnv()
const app = express()
// Middleware
app.use(
  cors({
    origin: [Frontend_URL],
    optionsSuccessStatus: 200,
    credentials: true,
  })
)
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/auth', authRouter)
/**
 * @description This is a middleware that checks if the user is authenticated
 * All routes are protected except the login and register routes
 */
app.use('*', withAuth)

// Routes
app.use('/investor', investorsRouter)
app.use('/investment', investmentsRouter)
app.use('/agent', agentRouter)
app.use('/doc', docsRouter)
app.use('/thumbnails', thumbnailRouter)
app.all('/', handleMethodNotAllowed)
app.all('/*', (req) => {
  throw new HttpError('NOT_FOUND', 'the route' + req.originalUrl + ' Not Found')
})

const port = process.env.PORT || 3000

app.use(errorHandler)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on port 3000!')
})
