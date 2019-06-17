import decodeJwtToken from '../util/auth'
import User from '../model/user'
import { signJwtToken } from '../util/auth'
import logger from '../util/logger'
import { async } from 'rxjs/internal/scheduler/async';

const initialCoin = 100

// return JWT token
export const login = async (req, res) => {
  const account = req.body.account || req.params.account
  const password = req.body.password || req.params.password
  const user = await User.findOne({$or: [
    {email: account}, {phone: account}
  ]})
  if (user) {
    if (user.comparePassword(password)) {
      const token = signJwtToken(user.getPublicFields())
      res.status(200).end(token)
    } else {
      res.status(401).end('PASSWORD_INCORRECT')
    }
  } else {
    res.status(401).end('USER_NOT_FOUND')
  }
}

export const logout = (req, res) => {}

export const updateUser = async (req, res) => {
  const targetUserId = req.params.id // string
  const currentUserId = req.user.id // number
  if (targetUserId !== currentUserId.toString()) res.status(403).end()
  const updateData = req.body
  try {
    const user = await User.findOneAndUpdate({ id: targetUserId }, updateData, {
      omitUndefined: true,
      new: true,
    })
    res.status(200).json(user.getPublicFields())
  } catch (err) {
    res.status(400).end('ERROR')
  }
}

export const createUser = async (req, res) => {
  const newData = req.body
  newData.coin = initialCoin
  try {
    const user = new User(newData)
    await user.save()
    res.status(200).json(user.getPublicFields())
  } catch (err) {
    logger.info(err)
    const another = await User.findOne({$or: [
      {email: newData.email},
      {phone: newData.phone},
      {name: newData.name},
      {studentID: newData.studentID}
    ]})
    if (another) {
      const msg = another.email == newData.email ? 'email' :(
        another.phone == newData.phone ? 'phone' :(
          another.name == newData.name ? 'name' : 'studentID'
        )
      )
      res.status(400).end(msg)
    }
    res.status(400).end('invalid')
  }
}

export const getUsers = async (req, res) => {
  const condition = req.query
  const userId = req.params.id
  try {
    if (userId === undefined) {
      const users = await User.find(condition)
      res.status(200).json(users.map(user => user.getPublicFields()))
    } else {
      const user = await User.findOne({ id: userId })
      if (user) {
        res.status(200).json(user.getPublicFields())
      } else {
        res.status(404).end()
      }
    }
  } catch (err) {
    logger.error(err)
    res.status(400).end()
  }
}

export const deleteUser = async (req, res) => {

}
