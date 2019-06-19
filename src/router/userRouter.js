import express from 'express'
import * as userController from '../controller/user'
const router = express.Router()

router.get('/test', userController.test)
router.post('/', userController.createUser)
router.get('/', userController.getUsers)
router.post('/login', userController.login)
router.get('/:uid', userController.getUser)
router.delete('/:uid', userController.deleteUser)
router.patch('/:uid', userController.updateUser)
router.get('/:uid/check', userController.check)

export default router
