import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { getNextUid } from './global'
dotenv.config()
if (process.env.MODE === 'DEVELOPMENT') {
  mongoose.set('debug', true)
}

const userSchema = new mongoose.Schema({
  uid: {
    required: false,
    type: Number,
    unique: true,
  },
  name: {
    required: true,
    type: String,
    unique: true,
  }, // for organization nickname eqs name
  name: {
    required: true,
    type: String,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isOrganization: {
    type: Boolean,
    required: true,
  },
  // 个人账户
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
    required: true,
    unique: true,
  },
  // 组织账户
  address: {
    type: String,
    required: function() {
      return this.isOrganization === true
    },
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
  if (this.id) next()
  this.id = await getNextUid()
  next()
})
userSchema.pre('save', function(next) {
  if (this.isOrganization == true) {
    delete this.gender
    delete this.birthYear
  } else [delete this.address]
})

// instance method
userSchema.methods.getPublicFields = function() {
  let common = {
    id: this.id,
    nickname: this.nickname,
    name: this.name,
    email: this.email,
    phone: this.phone,
    isOrganization: this.isOrganization,
  }
  if (this.isOrganization) {
    return Object.assign(common, {
      address: this.address,
    })
  } else {
    return Object.assign(common, {
      birthYear: this.birthYear,
      gender: this.gender,
      studentID: this.studentID,
    })
  }
}

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.update = async function(newUserInfo) {
  Object.keys(newUserInfo).forEach(val => (this[val] = newUserInfo[val]))
  try {
    await this.save()
  } catch (err) {
    return err
  }
}

const User = mongoose.model('User', userSchema)

export default User
