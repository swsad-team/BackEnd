import express from 'express'
import * as taskController from '../controller/task'
const router = express.Router()
const guard = ({ login = true, user = false, organization = false } = {}) => {
  return (req, res, next) => {
    if (
      (req.user === undefined && login) ||
      (req.user.isOrganization && user) ||
      (!req.user.isOrganization && organization)
    ) {
      res.status(403).end()
    } else {
      next()
    }
  }
}
router.get('/', taskController.getTasks)
router.get('/:tid', taskController.getTasks)
router.get(
  '/:tid/questionnaire',
  guard({
    user: true,
  }),
  taskController.getQuestionnaireOfTask
)
router.post('/', guard(), taskController.createTask)
router.put('/:tid', guard(), taskController.updateTask)
router.post(
  '/:tid/attend',
  guard({
    user: true,
  }),
  taskController.attendTask
)
router.post(
  '/:tid/finish',
  guard({
    user: true,
  }),
  taskController.finishTask
)
router.post(
  '/:tid/quit',
  guard({
    user: true,
  }),
  taskController.quitTask
)

export default router
