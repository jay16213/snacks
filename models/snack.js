const mongoose = require('mongoose')

let snackSchema = mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true }
})

module.exports = mongoose.model('Snack', snackSchema)
