import express from 'express'
import * as userController from '../controller/user'
const router = express.Router()

router.post('/', userController.createUser)
router.get('/', userController.getUsers)
router.get('/login', userController.login)
router.get('/:id', userController.getUsers)
router.delete('/:id', userController.deleteUser)

// not in API.yaml
router.put('/:id', userController.updateUser)

export default router
