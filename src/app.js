import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import userRouter from './router/userRouter'
import taskRouter from './router/taskRouter'
import logger from './util/logger'
import config from './config'
import { authenticate } from './util/auth'

const app = express()

config(app)

app.use(morgan('tiny'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(authenticate)
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

app.use(function(err, req, res, next) {
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
      app.listen(app.get('port'), () => {
        logger.info(`Server running on port ${app.get('port')}`)
      })
    }
  }
)
