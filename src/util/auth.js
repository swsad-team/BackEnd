import jwt from 'jsonwebtoken'
import logger from './logger'
import dotenv from 'dotenv'

dotenv.config()

const expireTime = 60 * 60 * 24 // one day

const key = process.env.JWT_KEY // key should be defined in .env file

/**
 * Generate JWT token with given claims.
 * @param {Object} payload claims to be stored in the token
 * @returns {string} jwt token
 */
export const signJwtToken = (payload) => {
  return jwt.sign(
    payload,
    key,
    {
      expiresIn: expireTime,
    }
  )
}

/**
 * Decode JWT token to data.
 * @param {string} token jwt token
 * @returns {Object | undefined} decoded claims or `undefined` when err occurred
 */
export const decodeJwtToken = (token) => {
  try {
    const payload = jwt.verify(token, key)
    return payload
  } catch (err) {
    return undefined
  }
}
