import mongoose from 'mongoose'

if (process.env.NODE_ENV === 'debug') {
  mongoose.set('debug', true)
}

const globalSchema = new mongoose.Schema({
  uidCount: {
    type: Number,
    default: 0,
  },
  tidCount: {
    type: Number,
    default: 0,
  },
  // aidCount: {
  //   type: Number,
  //   default: 0,
  // },
})

const Global = mongoose.model('Glob', globalSchema)

export default Global

export const getNextUid = async () => {
  const g = await Global.findOne({})
  if (g) {
    g.uidCount++
    await g.save()
    return g.uidCount
  } else {
    const newG = new Global({
      uidCount: 0,
    })
    await newG.save()
    return newG.uidCount
  }
}

export const getNextTid = async () => {
  const g = await Global.findOne({})
  if (g) {
    g.tidCount++
    await g.save()
    return g.tidCount
  } else {
    const newG = new Global({
      tidCount: 0,
    })
    await newG.save()
    return newG.tidCount
  }
}

// export const getNextAid = async () => {
//   const g = await Global.findOne({})
//   if (g) {
//     g.aidCount++
//     await g.save()
//     return g.aidCount
//   } else {
//     const newG = new Global({
//       aidCount: 0,
//     })
//     await newG.save()
//     return newG.aidCount
//   }
// }
