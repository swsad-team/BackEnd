import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { getNextAid } from './global'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const answerSchema = new mongoose.Schema({
  aid: {
    type: Number,
    required: false,
  },
  tid: {
    type: Number,
    required: true,
  },
  uid: {
    type: Number,
    required: true,
  },
  content: {
    type: [String],
    required: true,
  },
})

answerSchema.pre('save', async function(next) {
  if (this.aid) next()
  this.aid = await getNextAid()
  next()
})

const Answer = mongoose.model('Answer', answerSchema)

export default Answer
