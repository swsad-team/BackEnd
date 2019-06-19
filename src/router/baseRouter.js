import express from 'express'
import taskRouter from './taskRouter'
import userRouter from './userRouter'

const router = express.Router()

router.all('/users', userRouter)
router.all('/tasks', taskRouter)

export default router
