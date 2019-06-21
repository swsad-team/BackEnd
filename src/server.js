import mongoose from 'mongoose'
import app from './app'
import logger from './util/logger'

mongoose.connect(
  app.get('db_uri'),
  { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
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
