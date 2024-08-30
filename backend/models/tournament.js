const mongoose = require('mongoose')

const tournamentSchema = mongoose.Schema({
  tournament: {
    type: String,
    minlength: 3,
    required: true,
    unique: true
  },
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    }
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

tournamentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const Tournament = mongoose.model('Tournament', tournamentSchema)
module.exports = Tournament