import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { HttpError, errorHandler } from './middleware/errorHandler'
import { handleMethodNotAllowed } from './middleware/handleMethodNotAllowed'
import { agentRouter } from './routes/agent'
import { expensesRouter } from './routes/expense'
import investorsRouter from './routes/investor'
import { propertyRouter } from './routes/property'

config()
const app = express()
// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
  })
)
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/investor', investorsRouter)
app.use('/expense', expensesRouter)
app.use('/property', propertyRouter)
app.use('/agent', agentRouter)
app.all('/', handleMethodNotAllowed)

app.all('/*', (req) => {
  throw new HttpError('NOT_FOUND', req.originalUrl + ' Not Found')
})

const port = process.env.PORT || 3000

app.use(errorHandler)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on port 3000!')
})
