import decodeJwtToken from '../util/auth'
import User from '../model/user'
import { signJwtToken } from '../util/auth'
import logger from '../util/logger'

// return JWT token
export const login = async (req, res) => {
  const identity = {
    nicname: req.body.name || req.params.name,
    email: req.body.email || req.params.email,
  }
  Object.keys(identity).forEach(
    key => identity[key] === undefined && delete identity[key]
  )
  const password = req.body.password || req.params.password
  const user = await User.findOne(identity)
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
  try {
    const user = new User(newData)
    await user.save()
    res.status(200).json(user.getPublicFields())
  } catch (err) {
    logger.info(err)
    res.status(400).end()
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
