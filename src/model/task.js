import { getNextTid } from './global'
import mongoose from 'mongoose'

if (process.env.NODE_ENV === 'debug') {
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
    default: Date.now,
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
      return val > 0 && val >= this.participants.length
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
  organizational: {
    type: Boolean,
    required: true,
  },
  // if task is not a questionnaire, none
  question: {
    type: [
      {
        isRequired: {
          type: Boolean,
          required: true,
        }, // required to fill in
        type: {
          type: String,
          enum: ['fill', 'single', 'multiple'],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        options: {
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
    validate: function(val) {
      return !this.isQuestionnaire || val.length !== 0
    },
  },
  isFull: {
    type: Boolean,
    default: false,
  },
  isValid: {
    type: Boolean,
    default: true,
  },

  // questions: questionSchema,
})

taskSchema.pre('save', async function(next) {
  if (this.tid === undefined) {
    this.tid = await getNextTid()
  }
  next()
})
taskSchema.pre('save', function(next) {
  if (this.isQuestionnaire !== true) {
    this.question = undefined
  }
  this.isValid = !(
    this.isCancel ||
    this.endTime < Date.now() ||
    this.finishers.length === this.numOfPeople
  )
  this.isFull =
    this.participants && this.participants.length >= this.numOfPeople
  next()
})

taskSchema.methods.getTaskFields = function() {
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
    isValid: this.isValid,
    organizational: this.organizational,
    isCancel: this.isCancel,
  }
}
taskSchema.methods.getQuestionnaire = function() {
  return this.question
}

const Task = mongoose.model('Task', taskSchema)

export default Task
