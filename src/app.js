import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
dotenv.config()

const app = express()


app.use(morgan('tiny'))
app.use(cookieParser())

app.set("port", process.env.PORT || 3000)

app.all('*', (req, res) => {
  res.send('Hi')
})

export default app