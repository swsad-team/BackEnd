import { authenticate } from './util/auth'
import bodyParser from 'body-parser'
import config from './config'
import cookieParser from 'cookie-parser'
import express from 'express'
import logger from './util/logger'
import mongoose from 'mongoose'
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

mongoose.connect(
  app.get('db_uri'),
  { useNewUrlParser: true, useFindAndModify: false },
  err => {
    if (err) {
      logger.error(err)
    } else {
      logger.info('Connected to database')
    }
  }
)

app.listen(app.get('port'), () => {
  logger.info(`Server running on port ${app.get('port')}`)
})
