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
    type: Number,
    required: true,
    unique: true,
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
  },
  name: {
    required: true,
    type: String,
    unique: true,
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
    type: Boolean,
    required: true,
  },
  // 个人账户
  realname: {
    type: String,
    required: function() {
      return this.isOrganization !== true
    },
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
  if (this.uid) next()
  this.uid = await getNextUid()
  next()
})
userSchema.pre('save', function(next) {
  if (this.isOrganization == true) {
    delete this.gender
    delete this.birthYear
    delete this.realname
    delete this.studentId
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
