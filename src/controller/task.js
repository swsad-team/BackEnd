import Task from '../model/task'
import logger from '../util/logger'

export const getTasks = async (req, res) => {
  const { offset, limit, sort, ...condition } = req.query
  const tid = req.params.tid
  try {
    if (tid === undefined) {
      const tasks = await Task.find(condition, null, {
        skip: offset,
        limit,
        sort: {},
      })
      res.status(200).json(tasks.map(t => t.getTaskFields()))
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
        if (task.participants.includes(uid)) {
          res.status(200).json(task.getQuestionnaire())
        } else {
          res.status(403).json()
        }
      } else {
        req.status(404).end()
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
  const coins = data.reward * data.numOfPeople
  try {
    // TODO: calculate reward

    const task = new Task(data)
    await task.save()
    res.status(200).json(task.getTaskFields())
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}

export const attendTask = async (req, res) => {
  const tid = req.params.tid
  try {
    const task = await Task.findOne({ tid })
    if (task === null) {
      res.status(404).end()
      return
    }
    if (!task.isValid()) {
      res.status(400).end()
      return
    }
    if (task.participants.includes(req.user.uid)) {
      res.status(400).end()
      return
    }
    // start session
    task.participants.push(req.user.uid)
    await task.save()
    // TODO: 处理用户参加状态
    res.status(200).end()
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}
export const finishTask = async (req, res) => {
  const tid = req.params.tid
  try {
    const task = await Task.findOne({ tid })
    if (tid.isQuestionnaire) {
      const uid = req.user.uid
      if (!task.participants.includes(uid)) {
        res.status(400).end()
      }
      const answer = req.body
      // TODO: check save answer here
      task.finishers.push(uid)
      await task.save()
      res.status(200).end()
    } else {
      const self = req.user.uid
      const uid = req.queru.user
      if (task.publisherId !== uid) {
        res.status(403).end()
        return
      }
      if (!task.participants.includes(uid)) {
        res.status(400).end()
        return
      }
      task.finishers.push(uid)
      await task.save()
      res.status(200).end()
    }
  } catch (err) {
    res.status(400).end()
  }
}

export const quitTask = async (req, res) => {
  const tid = req.params.tid
  const uid = req.user.uid
  try {
    const task = await Task.findOne({ tid })
    if (task.finishers.includes(uid) || !task.participants.includes(uid)) {
      res.status(400).end()
      return
    }
    task.participants = task.participants.filter(u => u !== uid)
    await task.save()
    res.status(200).end()
  } catch (err) {
    logger.info(err)
    res.status(400).end()
  }
}

export const updateTask = async (req, res) => {
  const data = req.body
  const tid = req.params.tid
  const uid = req.user.uid
  delete data.participants
  delete data.finishers
  delete data.startTime
  try {
    const task = await findOneAndUpdate({ tid, publisherId: uid }, data, {
      omitUndefined: true,
      new: true,
    })
    if (task === null) {
      res.status(404).end()
      return
    }
    res.status(200).json(task.getPublicFields())
  } catch (err) {
    res.status(403).end()
  }
}
