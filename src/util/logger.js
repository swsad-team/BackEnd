import winston from 'winston'
const { combine, timestamp, printf } = winston.format

const formatter = combine(
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`
  })
)
let transports = [
  new winston.transports.File({ filename: 'error.log', level: 'error' }),
]
if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.Console())
}

const logger = winston.createLogger({
  level: 'info',
  format: formatter,
  transports,
})

export default logger
