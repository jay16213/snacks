const express = require('express')
const http = require('http')
const router = express.Router()

// handle '/buy' at slack
router.post('/buy', (req, res) => {
})

router.post('/transaction', (req, res) => {
})

// handle '/wallet' at slack
router.post('/wallet', (req, res) => {
})

router.post('/sell', (req, res) => {
})

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = router
