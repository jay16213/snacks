const express = require('express')
const router = express.Router()

router.post('/sell', (req, res) => {
})

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = router
