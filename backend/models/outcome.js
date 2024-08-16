const mongoose = require('mongoose')

const outcomeSchema = mongoose.Schema({
  goals_home: {
    type: Number,
    required: true
  },
  goals_visitor: {
    type: Number,
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    unique: true
  }
})

outcomeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const Outcome = mongoose.model('Outcome', outcomeSchema)

module.exports = Outcome