import express from 'express'
import * as userController from '../controller/user'
const router = express.Router()

router.post('/', userController.createUser)
router.get('/', userController.getUsers)
router.get('/login', userController.login)
router.get('/:uid', userController.getUser)
router.delete('/:uid', userController.deleteUser)
router.patch('/:uid', userController.updateUser)

export default router
