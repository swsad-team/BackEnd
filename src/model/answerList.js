import mongoose from 'mongoose'
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
  answers: {
    type: [
      {
        uid: {
          type: Number,
          required: true,
        },
        content: {
          type: [Schema.Types.Mixed], // types determined by questionnaire
          required: true,
        },
      },
    ],
    required: true,
  },
})

answerListSchema.methods.addAnswer = async function(uid, content) {
  if (this.answers.some(val => val.uid === uid)) return false
  this.answer.push({
    uid,
    content,
  })
  await tthis.save()
  return true
}

const AnswerList = mongoose.model('AnswerList', answerListSchema)

export default AnswerList
