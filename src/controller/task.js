import AnswerList from '../model/answerList'
import Task from '../model/task'
import User from '../model/user'
import logger from '../util/logger'
export const getTasks = async (req, res) => {
  logger.info('Controller: getTasks')
  let { page, per_page, sort, filter } = req.query
  const { tid } = req.params
  const user = req.user

  // filter
  const filterOption = {
    participable: {
      isValid: true,
      participants: { $ne: user && user.uid },
      publisherId: { $ne: user && user.uid },
    },
    valid: {
      isValid: { $eq: true },
    },
    organizational: {
      organizational: true,
    },
    personal: {
      organizational: false,
    },
    questionnaire: {
      isQuestionnaire: true,
    },
    mission: {
      isQuestionnaire: false,
    },
  }
  const queryOption =
    filter &&
    filter.reduce((acc, val) => ({ ...acc, ...filterOption[val] }), {})

  // pagination
  let skip
  let limit
  if (page) {
    skip = (page - 1) * per_page
    limit = Number(per_page)
  }

  // sort
  let sortOption
  switch (sort) {
    case 'time':
      sortOption = {
        startTime: -1,
      }
      break
    case 'coin':
      sortOption = {
        reward: -1,
      }
      break
    default:
      break
  }

  try {
    if (tid === undefined) {
      const tasks = await Task.find(queryOption, null, {
        skip,
        limit,
        sort: sortOption,
      })
      if (tasks.length > 0) {
        res.status(200).json(tasks.map(t => t.getTaskFields()))
      } else {
        res.status(404).end()
      }
    } else {
      const task = await Task.findOne({ tid })
      if (task) {
        res.status(200).json(task.getTaskFields())
      } else {
        res.status(404).end()
      }
    }
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}

export const getQuestionnaireOfTask = async (req, res) => {
  const tid = req.params.tid
  const uid = req.user.uid
  if (tid === undefined) {
    res.status(400).end()
  } else {
    try {
      const task = await Task.findOne({ tid })
      if (task) {
        if (task.isQuestionnaire === false) {
          res.status(404).end('NOT_QUESTIONNAIRE')
        } else if (
          task.participants.includes(uid) ||
          task.publisherId === uid
        ) {
          res.status(200).json(task.getQuestionnaire())
        } else {
          res.status(403).json()
        }
      } else {
        res.status(404).end()
      }
    } catch (err) {
      logger.error(err)
    }
  }
}

export const createTask = async (req, res) => {
  const data = req.body
  data.publisherId = req.user.uid
  delete data.participants
  delete data.finishers
  delete data.coinPool
  delete data.tid
  const coins = data.reward * data.numOfPeople
  data.organizational = req.user.isOrganization
  data.coinPool = coins
  if (req.user.coin < coins) {
    res.status(400).end('COIN_NOT_ENOUGHT')
    return
  }
  try {
    const task = new Task(data)
    req.user.coin -= coins
    await Promise.all([task.save(), req.user.save()])
    res.status(200).json(task.getTaskFields())
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}

export const attendTask = async (req, res) => {
  const tid = req.params.tid
  const self = req.user
  try {
    const task = await Task.findOne({ tid })
    if (task === null) {
      res.status(404).end('TASK_NOT_FOUND')
      return
    } else if (!task.isValid) {
      res.status(400).end('TASK_NOT_VALID')
    } else if (task.publisherId === self.uid) {
      res.status(400).end('USER_IS_PUBLISHER')
    } else if (task.participants.includes(self.uid)) {
      res.stastus(400).end('ALREADY_ATTEND')
    } else {
      task.participants.push(self.uid)
      await task.save()
      res.status(200).json(task)
    }
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}
export const finishTask = async (req, res) => {
  const tid = Number(req.params.tid)
  const self = req.user
  try {
    const task = await Task.findOne({ tid })
    if (task.isQuestionnaire) {
      const answers = req.body
      if (!task.participants.includes(self.uid)) {
        res.status(400).end('USER_NOT_IN_TASK')
        return
      }
      const targetAnswer = await AnswerList.findOne({
        uid: self.uid,
        tid,
      })
      if (targetAnswer !== null) {
        res.status(400).end('ANSWER_EXISTS')
        return
      }
      if (answers.length !== task.question.length) {
        res.status(400).end('INVALID_ANSWER')
        return
      }

      const answer = new AnswerList({
        tid,
        uid: self.uid,
        answers,
      })
      task.finishers.push(self.uid)
      task.coinPool -= task.reward
      req.user.coin += task.reward
      await Promise.all([answer.save(), task.save(), req.user.save()])
      res.status(200).json(task.getTaskFields())
    } else {
      const { user: targetUid } = req.body
      const target = await User.findOne({
        uid: targetUid,
      })
      if (target === null) {
        res.status(404).end('TARGET_USER_NOT_FOUND')
      }
      if (task.publisherId !== self.uid) {
        res.status(403).end('NOT_PUBLISHER')
        return
      }
      if (!task.participants.includes(targetUid)) {
        res.status(400).end('TARGET_USER_NOT_IN_TASK')
        return
      }
      task.finishers.push(targetUid)
      target.coin += task.reward
      task.coinPool -= task.reward
      await Promise.all([task.save(), target.save(), req.user.save()])
      res.status(200).json(task.getTaskFields())
    }
  } catch (err) {
    logger.info(err)
    res.status(400).end('UNKNOWN_ERROR')
  }
}

export const getAnswersOfTask = async (req, res) => {
  const user = req.user
  const tid = req.params.tid
  try {
    const task = await Task.findOne({
      tid,
    })
    if (task === null) {
      res.status(404).end('TASK_NOT_FOUND')
    }
    if (task.publisherId !== user.uid) {
      res.status(403).end('NOT_PUBLISHER')
    }
    const answers = await AnswerList.find(
      {
        tid,
      },
      'answers -_id uid'
    )
    res.status(200).json(answers)
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}

export const cancelTask = async (req, res) => {
  const tid = req.params.tid
  const self = req.user
  try {
    const task = await Task.findOne({ tid })
    if (task === null) {
      res.status(404).end('TASK_NOT_FOUND')
    } else if (task.publisherId !== self.uid) {
      res.status(403).end('NOT_PUBLISHER')
    } else if (!task.isValid) {
      res.status(400).end('TASK_NOT_VALID')
    } else if (task.finishers.length !== task.participants.length) {
      res.status(400).end('EXIST_USER_NOT_FINISHED')
    } else {
      task.isCancel = true
      self.coin += task.coinPool
      task.coinPool = 0
      await Promise.all([self.save(), task.save()])
      res.status(200).json(task.getTaskFields())
    }
  } catch (err) {
    logger.info(err)
    res.status(400).end('UNKOWN_ERROR')
  }
}

// export const quitTask = async (req, res) => {
//   const tid = req.params.tid
//   const uid = req.user.uid
//   try {
//     const task = await Task.findOne({ tid })
//     if (task.finishers.includes(uid) || !task.participants.includes(uid)) {
//       res.status(400).end()
//       return
//     }
//     task.participants = task.participants.filter(u => u !== uid)
//     await task.save()
//     res.status(200).end()
//   } catch (err) {
//     logger.info(err)
//     res.status(400).end()
//   }
// }

// export const updateTask = async (req, res) => {
//   const data = req.body
//   const tid = req.params.tid
//   const uid = req.user.uid
//   delete data.participants
//   delete data.finishers
//   delete data.startTime
//   try {
//     const task = await findOneAndUpdate({ tid, publisherId: uid }, data, {
//       omitUndefined: true,
//       new: true,
//     })
//     if (task === null) {
//       res.status(404).end()
//       return
//     }
//     res.status(200).json(task.getPublicFields())
//   } catch (err) {
//     res.status(403).end()
//   }
// }
