import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { getNextUid } from './global'
import moment from 'moment'
if (process.env.NODE_ENV === 'debug') {
  mongoose.set('debug', true)
}

const userSchema = new mongoose.Schema({
  uid: {
    type: Number,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: val => val.match(/^\d{11}$/),
  },
  name: {
    required: true,
    type: String,
    unique: true,
    validate: val => {
      return val.match(/^\s*$/) === null
    },
  }, // display name
  password: {
    type: String,
    required: true,
  },
  isOrganization: {
    type: Boolean,
    required: true,
  },
  coin: {
    type: Number,
    required: false,
    validate: val => val > 0,
  },
  lastCheckDate: {
    type: String,
    required: false,
  },
  // 个人账户
  realname: {
    type: String,
    required: function() {
      return this.isOrganization !== true
    },
    validate: val => val.match(/^\s*$/) === null,
  },
  birthYear: {
    type: Number,
    required: function() {
      return this.isOrganization !== true
    },
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() {
      return this.isOrganization !== true
    },
  },
  studentID: {
    type: String,
    unique: true,
    required: function() {
      return this.isOrganization !== true
    },
    validate: val => val.match(/\D/) === null,
  },
  // 组织账户
  address: {
    type: String,
    required: function() {
      return this.isOrganization === true
    },
    validate: val => val.match(/^\s*$/) === null,
  },
})

// hash password for security reason
userSchema.pre('save', async function(next) {
  const user = this
  if (user.isModified('password')) {
    try {
      const hash = await bcrypt.hash(user.password, 10)
      user.password = hash
      next()
    } catch (err) {
      next(err)
    }
  }
  next()
})
userSchema.pre('save', async function(next) {
  if (this.uid === undefined) {
    this.uid = await getNextUid()
  }
  next()
})
userSchema.pre('save', function(next) {
  // delete some property
  if (this.isOrganization === true) {
    this.gender = undefined
    this.birthYear = undefined
    this.realname = undefined
    this.studentID = undefined
  } else {
    this.address = undefined
  }
  // initial coin
  if (this.coin === undefined) {
    this.coin = 0
  }
  if (this.lastCheckDate === undefined) {
    this.lastCheckDate = moment.unix(0).format('YYYY/MM/DD')
  }
  next()
})
// instance method
userSchema.methods.getPublicFields = function() {
  let common = {
    uid: this.uid,
    name: this.name,
    email: this.email,
    phone: this.phone,
    coin: this.coin,
    isOrganization: this.isOrganization,
    isChecked: this.lastCheckDate >= moment().format('YYYY/MM/DD'),
  }
  if (this.isOrganization) {
    return { ...common, address: this.address }
  } else {
    return {
      ...common,
      birthYear: this.birthYear,
      gender: this.gender,
      realname: this.realname,
      studentID: this.studentID,
    }
  }
}

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
