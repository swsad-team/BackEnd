import mongoose from 'mongoose'

mongoose.set('debug', true)

const globalSchema = new mongoose.Schema({
  uidCount: {
    type: Number,
    default: 0,
  },
})

const Global = mongoose.model('Glob', globalSchema)

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
