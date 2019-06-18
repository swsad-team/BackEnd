import User from '../model/user'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import logger from './logger'

dotenv.config()

let expireTime = 60 * 60 * 24 // one day

if (process.env.MODE === 'DEVELOPMENT') {
  expireTime *= 365
}

const key = process.env.JWT_KEY // key should be defined in .env file

/**
 * Generate JWT token with given claims.
 * @param {Object} payload claims to be stored in the token
 * @returns {string} jwt token
 */
export const signJwtToken = payload => {
  return jwt.sign(payload, key, {
    expiresIn: expireTime,
  })
}

/**
 * Decode JWT token to data.
 * @param {string} token jwt token
 * @returns {Object | undefined} decoded claims or `undefined` when err occurred
 */
export const decodeJwtToken = token => {
  try {
    const payload = jwt.verify(token, key)
    return payload
  } catch (err) {
    logger.error(err)
    return null
  }
}

/**
 *
 * @description This middle ware is used to add `user` property into request.
 */
export const authenticate = async (req, _, next) => {
  if (
    req.header('authorization') &&
    req.header('authorization').startsWith('Bearer')
  ) {
    let token = req.header('authorization').split(/\s+/)[1]
    let payload = decodeJwtToken(token)
    if (payload && payload.uid !== undefined) {
      const user = await User.findOne({
        uid: payload.uid,
      })
      req.user = user
    }
  }
  next()
}
