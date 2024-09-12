const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  admin: Boolean,
  bets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bet'
    }
  ],
  scores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scores'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User