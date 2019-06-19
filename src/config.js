import dotenv from 'dotenv'
dotenv.config()
const config = app => {
  app.set('port', process.env.PORT || 3000)
  app.set('db_uri', process.env.MONGO_DB_URL)
  app.set('mode', process.env.MODE || 'DEVELOPMENT')
}

export default config
