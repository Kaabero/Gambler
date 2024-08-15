const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
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
  outcome_added: Boolean,
})

gameSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Game', gameSchema)