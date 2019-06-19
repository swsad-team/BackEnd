import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const answerListSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: true,
  },
  uid: {
    type: Number,
    required: true,
  },
  answers: {
    type: [mongoose.Schema.Types.Mixed], // types determined by questionnaire
    required: true,
  },
})

const AnswerList = mongoose.model('Answer', answerListSchema)

export default AnswerList
