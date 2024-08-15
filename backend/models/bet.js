const mongoose = require('mongoose')

const betSchema = mongoose.Schema({
  goals_home: {
    type: Number,
    required: true
  },
  goals_visitor: {
    type: Number,
    required: true
  },
  game: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
})

betSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Bet = mongoose.model('Bet', betSchema)

module.exports = Bet