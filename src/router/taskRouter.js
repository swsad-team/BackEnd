import * as taskController from '../controller/task'

import express from 'express'

const router = express.Router()
const guard = ({ login = true, user = false, organization = false } = {}) => {
  return (req, res, next) => {
    if (
      (!req.user && login) ||
      (user && req.user.isOrganization) ||
      (organization && !req.user.isOrganization)
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
router.get(
  '/:tid/answers',
  guard({
    user: true,
  }),
  taskController.getAnswersOfTask
)
router.post('/', guard(), taskController.createTask)
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
// router.post(
//   '/:tid/quit',
//   guard({
//     user: true,
//   }),
//   taskController.quitTask
// )

export default router
