import decodeJwtToken from '../util/auth'

/**
 * 
 * @description This middle ware is used to add `user` property into request.
 */
export const authenticate = (req, _, next) => {
  if (req.header.authorization && req.header.authorization.startsWith('Bearer')) {
    let token = req.header.authorization.split(' ')[1]
    let payload = decodeJwtToken(token)
    if (payload && payload['userId']) {
      // find user by id here.
    }
  }
  next()
}

export const updateUser = (req, res) => {

}

export const getUsers = (req, res) => {

}

export const getUserById = (req, res) => {

}