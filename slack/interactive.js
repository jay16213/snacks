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
  slackBot.showSellModal(trigger_id)
})

slackInteractives.viewSubmission('sell-submit', (payload) => {
  console.log('sell view subission', payload)
  let viewValues = payload.view.state.values

  let snackName = viewValues.snack_name.input.value
  let amount = parseInt(viewValues.snack_amount.input.value)
  let totalPrice = parseInt(viewValues.snack_total_price.input.value)
  console.log(viewValues)
  console.log(snackName, amount, totalPrice)
  Snack.exists({name: snackName}, (err, exists) => {
    if (err) {
      console.error(err)
      return
    }

    if (exists) {
      slackBot.sendDirectMessage(payload.user.id, `${snackName} has existed at store, you can't not sell the same thing until it sold out.`)
    } else {
      sellSnacks(payload.user, snackName, amount, totalPrice)
    }
  })
})

let buySnacks = async (slackUser, snackName, price) => {
  let newBalance = 0

  const session = await mongoose.startSession()
  try {
    let user = await User.findOne({slackId: slackUser.id})
    let snack = await Snack.findOne({name: snackName})

    session.startTransaction()
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
      newBalance = user.balance
      await user.save()

      // commit the changes if everything was successful
      await session.commitTransaction()
    }
  }
  catch (err) {
    // rollback any changes made in the database if error happened
    await session.abortTransaction()
    console.error(err)

    slackBot.sendDirectMessage(slackUser.id, `Server error when buying ${snackName}.`)
  }
  finally {
    session.endSession()

    let timestamp = moment().format('LLL')
    let msg = `You pay *$NT ${price}* for one ${snackName} at ${timestamp}.\nYour wallet has *$NT ${newBalance}* now`
    slackBot.sendDirectMessage(slackUser.id, msg)
  }
}

let sellSnacks = (slackUser, snackName, amount, totalPrice) => {
  User.findOne({id: slackUser.id}, (err, user) => {
    if (err) {
      console.error(err)
      return
    }

    let newSnack = new Snack()
    newSnack.name = snackName
    newSnack.amount = amount
    newSnack.price = calculatePrice(amount, totalPrice)
    newSnack.save().then(() => {
      slackBot.sendDirectMessage(user.id, `You sell new snack ${snackName}, $NT ${newSnack.price} for each.`)
      updateUserBalance(user, totalPrice)
    }).catch(err => {
      console.error(err)
      slackBot.sendDirectMessage(user.id, `save snack to db error: ${err}`)
      return
    })
  })

}

let updateUserBalance = (user, money) => {
  user.balance += money
  user.save().then(() => {
    slackBot.sendDirectMessage(user.id, `Return $NT ${money} to you. You wallet has $NT ${user.balance} now.`)
  }).catch(err => {
    console.error(err)
    slackBot.sendDirectMessage(user.id, `save new balance to db error: ${err}`)
  })
}

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = slackInteractives
