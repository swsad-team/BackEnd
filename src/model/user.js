import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: String,
  email: String,
  password: String
})

// hash password for security reason
Schema.pre('save', async function(next) {
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

const User = mongoose.model('User', userSchema)

// instance method

userSchema.methods.update = async function(user) {}

// static method
userSchema.statics.findByUserId = async function(userId) {
  return this.find({ userId })
}

userSchema.static.createUser = async function(userDto) {}

export default User
