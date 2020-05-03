const mongoose = require('mongoose')

let userSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  balance: { type: Number, required: true }
})

module.exports = mongoose.model('User', userSchema)
