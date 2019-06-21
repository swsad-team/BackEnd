import { authenticate } from './util/auth'
import bodyParser from 'body-parser'
import config from './config'
import cookieParser from 'cookie-parser'
import express from 'express'
import logger from './util/logger'
import morgan from 'morgan'
import router from './router/baseRouter'

const app = express()

config(app)

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny'))
}

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .send('Hello, world!')
//     .end()
// })
app.use(authenticate)
app.use('/api', router)

app.use(function(err, req, res) {
  logger.error(err.stack)
  res.status(500).end()
})

export default app
