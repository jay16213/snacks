const slackInteractiveMessages = require('@slack/interactive-messages')
const mongoose = require('mongoose');
const moment = require('moment')
const Snack = require('../models/snack')
const User = require('../models/user')
const slackBot = require('./bot')

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET

// init slack tools
const slackInteractives = slackInteractiveMessages.createMessageAdapter(slackSigningSecret)

// handle a buy action
slackInteractives.action({actionId: RegExp('buy:.*')}, async (payload, res) => {
  console.debug('buy action', payload)

  let slackUser = payload.user
  let action = payload.actions[0]

  let substr = action.value.split(':')
  snackName = substr[0]
  price = parseInt(substr[1])

  try {
    await buySnacks(slackUser, snackName, price)
  }
  catch (err) {
    console.error(err)
  }
})

slackInteractives.action({actionId: 'sell'}, async (payload, res) => {
  console.log('sell action', payload)
  await slackBot.showSellModal(payload.trigger_id)
})

slackInteractives.viewSubmission('sell:submit', async (payload) => {
  console.log('sell view subission', payload)
  let viewValues = payload.view.state.values

  let snackName = viewValues.snack_name.input.value
  let amount = parseInt(viewValues.snack_amount.input.value)
  let totalPrice = parseInt(viewValues.snack_total_price.input.value)

  if (isNaN(amount) || isNaN(totalPrice)) {
    slackBot.sendDirectMessage(payload.user.id, 'amount and totalPrice must be number')
    return
  }

  await sellSnacks(payload.user, snackName, amount, totalPrice)
})

let buySnacks = async (slackUser, snackName, price) => {
  try {
    let user = await User.findOne({slackId: slackUser.id})
    let snack = await Snack.findOne({name: snackName})

    if (user == null) {
      throw new Error(`user not found with slackId ${slackUser.id}`)
    }

    if (snack == null) {
      throw new Error(`snack not found with name ${snackName}`)
    }

    // sell one snack to user
    snack.amount--

    if (snack.amount == 0) {
      await Snack.deleteOne(snack)
      console.log(`${snack.name} has sold out, delet from db.`)
    } else {
      // save amount
      await snack.save()
      console.log(`Sold one ${snack.name} to ${user.name}, left amount: ${snack.amount}`)

      // user pay for snack
      user.balance -= snack.price
      await user.save()

      let timestamp = moment().format('LLL')
      let msg = `You pay *$NT ${price}* for one *${snackName}* at ${timestamp}.\nYour wallet has *$NT ${user.balance}* now.`
      await slackBot.sendDirectMessage(slackUser.id, msg)
    }
  }
  catch (err) {
    console.error(err)
    await slackBot.sendDirectMessage(slackUser.id, `Server error when buying ${snackName}.`)
  }
}

let sellSnacks = async (slackUser, snackName, amount, totalPrice) => {
  try {
    let snackExists = await Snack.exists({name: snackName})
    if (snackExists) {
      await slackBot.sendDirectMessage(slackUser.id, `${snackName} has existed at store, you can't not sell the same thing until it sold out.`)
    }
  }
  catch (err) {
    console.error(err)
    await slackBot.sendDirectMessage(slackUser.id, `Server error when checking the snack exists or not`)
    return
  }
  finally {
    let price = calculatePrice(amount, totalPrice)
    let newBalance = 0

    try {
      let user = await User.findOne({slackId: slackUser.id})
      if (user == null) {
        throw new Error(`user not found with slackId ${slackUser.id}`)
      }

      // sell new snack on the store
      await Snack.create([{name: snackName, amount: amount, price: price}])

      // return money to user's wallet
      user.balance += totalPrice
      newBalance = user.balance
      await user.save()

      let msg = `Sell *${snackName}* successfully, price: *$NT ${price}* for each.\nReturn *${totalPrice}* to your wallet, your wallet has ${newBalance} now.`
      await slackBot.sendDirectMessage(slackUser.id, msg)
    }
    catch (err) {
      console.error(err)
      await slackBot.sendDirectMessage(slackUser.id, `Server error when selling snack. Please try again later.`)
    }
  }
}

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = slackInteractives
