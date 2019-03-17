import app from './app'
import logger from './util/logger'
const server = app.listen(app.get('port'), () => {
  logger.info(`Server running on port:${app.get('port')}`)
})