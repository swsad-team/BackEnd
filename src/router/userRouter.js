import express from 'express'
import * as userController from '../controller/user'
const router = express.Router()

router.get('/login', userController.login)
router.get('/', userController.getUsers)
router.get('/:id', userController.getUsers)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUser)

export default router
