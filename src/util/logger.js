import winston from 'winston'
const { combine, timestamp, printf } = winston.format

const formatter = combine(
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`
  })
) 

const logger = winston.createLogger({
  level: 'info',
  format: formatter,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ]
})

export default logger