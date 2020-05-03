const express = require('express')
const slackBot = require('./slack/bot')
const router = express.Router()


let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = router
