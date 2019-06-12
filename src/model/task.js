import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { getNextTid } from './global'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const taskSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isQuestion: {
    type: Boolean,
    required: true,
  },
  startTime: {
    required: true,
    type: Date,
    default: Date.now,
  },
  endTime: {
    required: true,
    type: Date,
    default: Date.now,
  },
  reward: {
    type: Number,
    required: true,
  },
  coinPool: {
    type: Number,
    required: true,
  },
  numOfPeople: {
    type: Number,
    required: true,
  },
  participant: [{
    type: Number,
  }],
  finisher: [{
    type: Number,
  }],
  // if task is a questionnaire, none
  question: [{
    isRequired: {
      type: Boolean,
      required: true,
    }, // required to fill in
    questionType: {
      type: String,
      enum: ['fill', 'single', 'multiple'],
      required: true,
    },
    questionTitle: {
      type: String,
      required: true,
    },
    option: {
      type: [String],
      required: function() {
        return this.questionType !== 'fill'
      },
    },
  }]
})

taskSchema.pre('save', async function(next) {
  if (this.tid) next()
  this.tid = await getNextTid()
  next()
})
taskSchema.pre('save', function(next) {
  if (this.isQuestion != true) {
    delete this.question
  }
  next()
})

const Task = mongoose.model('Task', taskSchema)

export default Task
