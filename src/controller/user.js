import User from '../model/user'
import { signJwtToken } from '../util/auth'
import logger from '../util/logger'

const initialCoin = 100

// return JWT token
export const login = async (req, res) => {
  logger.info('CONTROLLER: login')
  const account = req.body.account
  const password = req.body.password
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

export const updateUser = async (req, res) => {
  logger.info('CONTROLLER: updateUser')
  const self = req.user
  if (self.uid !== Number(req.params.uid)) {
    res.status(403).end()
  }
  const data = req.body

  const forbiddenProperties = [
    'uid',
    'isOrganization',
    'studentID',
    'phone',
    'email',
    'coin',
    '_id',
    '__v',
  ]
  if (Object.keys(data).some(key => forbiddenProperties.includes(key))) {
    res.status(400).end('INVALID_PROPERTY')
    return
  }
  try {
    Object.keys(data).forEach(key => (self[key] = data[key]))
    await self.save()

    res.status(200).json(self.getPublicFields())
  } catch (err) {
    logger.info(err)
    if (err.name === 'ValidationError') {
      res.status(400).end('VALIDATION_ERROR')
      return
    }
    res.status(400).end('UNKNOWN_ERROR')
  }
}

export const createUser = async (req, res) => {
  logger.info('CONTROLLER: createUser')

  const newData = req.body
  delete newData.uid
  newData.coin = initialCoin
  const checkProperties = ['email', 'phone', 'name', 'studentID']
  try {
    // check user
    const another = await User.findOne({
      $or: checkProperties.map(val => ({
        [val]: newData[val],
      })),
    })
    if (another) {
      const msg = checkProperties
        .filter(val => another[val] === newData[val])
        .map(val => `DUPLICATE_${val.toUpperCase()}`)
      res.status(400).json(msg)
      return
    }
    const user = new User(newData)
    await user.save()
    res.status(201).json(user.getPublicFields())
  } catch (err) {
    logger.info(err)
    if (err.name === 'ValidationError') {
      res.status(400).end('VALIDATION_ERROR')
      return
    }
    res.status(400).end('UNKNOWN_ERROR')
  }
}

export const getUser = async (req, res) => {
  logger.info('CONTROLLER: getUser')
  const self = req.user
  if (self.uid !== Number(req.params.uid)) {
    const user = await User.findOne({ uid: req.params.uid })
    if (user === null) {
      res.status(404).end()
    }
    res.status(200).json({
      ...user.getPublicFields(),
      isChecked: undefined,
      coin: undefined,
    })
  } else {
    res.status(200).json(self.getPublicFields())
  }
}

export const getUsers = async (req, res) => {
  logger.info('CONTROLLER: getUsers')

  const uidArray = req.query.uid
  if (!Array.isArray(uidArray) || uidArray.length === 0) {
    res.status(400).end('EMPTY_USER')
    return
  }
  try {
    const users = await User.find({ uid: uidArray })
    if (users.length === 0) {
      res.status(404).end()
    }
    res.status(200).json(
      users.map(user => {
        user = user.getPublicFields()
        user.isChecked = undefined
        user.coin = undefined
        return user
      })
    )
  } catch (err) {
    logger.error(err)
    res.status(400).end('UNKNOWN_ERROR')
  }
}

export const deleteUser = async (req, res) => {
  logger.info('CONTROLLER: deleteUser')

  const uid = req.body.uid
  if (req.user.uid !== uid) {
    res.status(403).end()
    return
  }
  try {
    await User.deleteOne({ uid: uid })
    res.status(200).end()
  } catch (err) {
    logger.info(err)
    res.status(400).end('UNKNOWN_ERROR')
  }
}

export const check = async (req, res) => {
  logger.info('CONTROLLER: check')

  const self = req.user
  try {
    const today = new Date().toLocaleDateString({
      month: '2-digit',
      day: '2-digit',
    })
    if (self.lastCheckDate < today) {
      self.coin += 50
      self.lastCheckDate = today
      await self.save()
      res.status(200).json({
        coin: self.coin,
        isChecked: true,
      })
    } else {
      res.status(404).end('ALREADY_CHECKED')
    }
  } catch (err) {
    logger.info(err)
    res.status(400).end('UNKNOWN_ERROR')
  }
}
