import express from 'express'
import * as userController from '../controller/user'
const router = express.Router()

const loginGuard = (req, res, next) => {
  if (!req.user) {
    res.status(401).end()
  } else {
    next()
  }
}

// router.get('/test', userController.test)
router.post('/', userController.createUser)
router.get('/', userController.getUsers)
router.post('/login', userController.login)
router.post('/check', loginGuard, userController.check)
router.get('/:uid', loginGuard, userController.getUser)
router.patch('/:uid', loginGuard, userController.updateUser)
router.delete('/:uid', loginGuard, userController.deleteUser)

export default router
