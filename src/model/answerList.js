import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const answerListSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: true,
  },
  answer: {
    type: [{
      uid: {
        type: Number,
        required: true,
      },
      content: {
        type: [String],
        required: true,
      },
    }],
    required: true,
  },
})

// answerListSchema.pre('save', async function(next) {
//   if (this.aid) next()
//   this.aid = await getNextAid()
//   next()
// })

const AnswerList = mongoose.model('AnswerList', answerListSchema)

export default AnswerList
