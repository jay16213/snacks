const mongoose = require('mongoose')

let walletSchema = mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  balance: {type: Number, required: true }
})

module.exports = mongoose.model('Wallet', walletSchema)
