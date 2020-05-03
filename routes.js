const express = require('express')
const slackBot = require('./slack/bot')
const router = express.Router()

router.post('/sell', (req, res) => {
  console.log(req)
  console.log(req.body)
  console.log(req.payload)
  res.sendStatus(200)

  // channel = req.payload.channel_id
  // userID = req.body.user_id
  // slackBot.showSellModal(channel, userID)
})

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = router
