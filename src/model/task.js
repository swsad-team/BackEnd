import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { getNextTid } from './global'
import logger from '../util/logger'
import { thisExpression } from '@babel/types'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const taskSchema = new mongoose.Schema({
  tid: {
    type: Number,
    required: false,
    unique: true,
  },
  publisherId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    validate: val => val.match(/^\s*$/) === null,
  },
  description: {
    type: String,
    required: true,
    validate: val => val.match(/^\s*$/) === null,
  },
  isQuestionnaire: {
    type: Boolean,
    required: true,
  },
  startTime: {
    required: false,
    type: Date,
    default: Date.now(),
  },
  endTime: {
    required: true,
    type: Date,
    validate: val => val > Date.now(),
  },
  reward: {
    type: Number,
    required: true,
    validate: val => val > 0,
  },
  coinPool: {
    type: Number,
    required: true,
    default: function() {
      return this.reward * this.numOfPeople
    },
    validate: val => val >= 0,
  },
  numOfPeople: {
    type: Number,
    required: true,
    validate: function(val) {
      return val > 0 && val > this.participants.length
    },
  },
  participants: {
    type: [Number],
    default: [],
    validate: function(val) {
      return val.length <= this.numOfPeople
    },
  },
  finishers: {
    type: [Number],
    default: [],
    validate: function(val) {
      return val.length <= this.numOfPeople
    },
  },
  isCancel: {
    type: Boolean,
    default: false,
    validate: function(val) {
      if (val === true) {
        return this.finishers.length === this.participants.length
      } else {
        return true
      }
    },
  },
  // if task is not a questionnaire, none
  question: {
    type: [
      {
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
      },
    ],
    required: function() {
      return this.isQuestionnaire
    },
    validate: val => val && val.length !== 0,
  },

  // questions: questionSchema,
})

taskSchema.pre('save', async function(next) {
  if (this.tid === undefined) this.tid = await getNextTid()
  next()
})
taskSchema.pre('save', function(next) {
  if (this.isQuestion !== true) {
    delete this.question
  }
  next()
})
taskSchema.methods.getTaskFields = function() {
  logger.info(this.participants)
  return {
    tid: this.tid,
    publisherId: this.publisherId,
    title: this.title,
    description: this.description,
    isQuestionnaire: this.isQuestionnaire,
    startTime: this.startTime,
    endTime: this.endTime,
    reward: this.reward,
    coinPool: this.coinPool,
    numOfPeople: this.numOfPeople,
    participants: this.participants,
    finishers: this.finishers,
  }
}
taskSchema.methods.getQuestionnaire = function() {
  return this.question
}
taskSchema.methods.isValid = function() {
  return (
    !this.isCancel &&
    this.participants.length < this.numOfPeople &&
    this.endTime > Date.now()
  )
}

const Task = mongoose.model('Task', taskSchema)

export default Task
