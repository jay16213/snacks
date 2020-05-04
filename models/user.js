const mongoose = require('mongoose')

let userSchema = mongoose.Schema({
  slackId: { type: String, required: true },
  name: { type: String },
  admin: { type: Boolean, required: true, default: false },
  balance: { type: Number, required: true }
})

module.exports = mongoose.model('User', userSchema)
