import express from 'express'
import taskRouter from './taskRouter'
import userRouter from './userRouter'

const router = express.Router()

router.use('/users', userRouter)
router.use('/tasks', taskRouter)

export default router
