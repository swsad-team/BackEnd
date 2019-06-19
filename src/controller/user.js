import decodeJwtToken from '../util/auth'
import User from '../model/user'
import { signJwtToken } from '../util/auth'
import logger from '../util/logger'
import { async } from 'rxjs/internal/scheduler/async'

const initialCoin = 100

// return JWT token
export const login = async (req, res) => {
  const account = req.body.account || req.params.account
  const password = req.body.password || req.params.password
  const user = await User.findOne({
    $or: [{ email: account }, { phone: account }],
  })
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
  const id = req.params.uid
  var data = req.body
  if (
    data.uid ||
    data.isOrganization ||
    data.studentID ||
    data.phone ||
    data.email
  ) {
    res.status(400).end('Invalid property')
  }
  try {
    const user = await User.findOneAndUpdate({ uid: id }, data, {
      new: true,
    })
    if (user) {
      res.status(200).json(user.getPublicFields())
    } else {
      res.status(404).end('NOT found user')
    }
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
    const another = await User.findOne({
      $or: [
        { email: newData.email },
        { phone: newData.phone },
        { name: newData.name },
        { studentID: newData.studentID },
      ],
    })
    if (another) {
      const msg =
        another.email == newData.email
          ? 'email'
          : another.phone == newData.phone
          ? 'phone'
          : another.name == newData.name
          ? 'name'
          : 'studentID'
      res.status(400).end(msg)
    }
    res.status(400).end('invalid')
  }
}

export const getUser = async (req, res) => {
  const id = req.params.uid
  try {
    const user = await User.findOne({ uid: req.params.uid })
    if (user) {
      res.status(200).json(user.getPublicFields())
    } else {
      res.status(404).end('NOT found user')
    }
  } catch (err) {
    res.status(400).end('ERROR')
  }
}

export const getUsers = async (req, res) => {
  const uidArray = req.body
  if (uidArray.length == 0) {
    res.status(400).end('Empty array')
  }
  try {
    if (uidArray) {
      const users = await User.find({ uid: uidArray })
      res.status(200).json(
        users.map(user => {
          user = user.getPublicFields()
          user.coin = undefined
          return user
        })
      )
    }
  } catch (err) {
    logger.error(err)
    res.status(400).end()
  }
}

export const deleteUser = async (req, res) => {
  const id = req.params.uid
  try {
    const user = await User.findOneAndDelete({ uid: id })
    if (user) {
      res.status(200).end('Delete Successful')
    } else {
      res.status(404).end('NOT found uid')
    }
  } catch (err) {
    res.status(400).end('ERROR')
  }
}
