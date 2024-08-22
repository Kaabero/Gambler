const mongoose = require('mongoose')

const gameSchema = mongoose.Schema({
  home_team: {
    type: String,
    minlength: 3,
    required: true
  },
  visitor_team: {
    type: String,
    minlength: 3,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  bets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bet'
    }
  ],
  outcome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outcome'
  }
})


gameSchema.index({ home_team: 1, visitor_team: 1, date: 1 }, { unique: true })

gameSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const Game = mongoose.model('Game', gameSchema)

module.exports = Game