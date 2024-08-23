const mongoose = require('mongoose')

const scoresSchema = mongoose.Schema({
  points: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outcome',
    required: true
  }
})

scoresSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const Scores = mongoose.model('Scores', scoresSchema)

module.exports = Scores