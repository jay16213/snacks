const slackInteractiveMessages = require('@slack/interactive-messages')
const moment = require('moment')
const Snack = require('../models/snack')
const User = require('../models/user')
const slackBot = require('./bot')
const config  = require('../config.json')

// init slack tools
const slackInteractives = slackInteractiveMessages.createMessageAdapter(config.slackSigningSecret)

// handle a buy action
slackInteractives.action({actionId: RegExp('buy:.*')}, async (payload, res) => {
  console.debug('buy action', payload)

  let slackUser = payload.user
  let action = payload.actions[0]

  let substr = action.value.split(':')
  snackName = substr[0]
  price = parseInt(substr[1], 10)

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

// user press pay button
slackInteractives.action({actionId: 'pay:request'}, async (payload, res) => {
  console.log('pay request action', payload)
  await slackBot.showPayModal(payload.trigger_id)
})

// admin confirm the user payment
slackInteractives.action({actionId: 'payment:confirm'}, async (payload, respond) => {
  console.log('pay confirm action', payload)

  let substr = payload.actions[0].value.split(':')
  let slackUserId = substr[0]
  let payment = parseInt(substr[1], 10)

  let user = await User.findOne({slackId: slackUserId})

  if (user == null) {
    await slackBot.sendDirectMessage(payload.user.id, 'user not found')
  } else {
    user.balance += payment
    await user.save()

    // notify the user
    await slackBot.sendDirectMessage(user.slackId, `:+1: Admin has verified your payment. Your wallet has *$NT ${user.balance}* now.`)
    // notify the admin
    let payVerify = require('./views/payVerify')
    payVerify.blocks[0].text.text = `:bank: ${user.name} want to pay`
    payVerify.blocks[1].fields[0].text = `>:dollar: *Payment*\n>$NT ${payment}`
    payVerify.blocks[2].text.text = `:+1: You has verified this payment at ${moment().format('LLL')}`
    await respond({blocks: payVerify.blocks, replace_original: true })
  }
})

// admin deny the user payment
slackInteractives.action({actionId: 'payment:deny'}, async (payload, respond) => {
  console.log('pay deny action', payload)

  let substr = payload.actions[0].value.split(':')
  let slackUserId = substr[0]

  let user = await User.findOne({slackId: slackUserId})

  if (user == null) {
    await slackBot.sendDirectMessage(payload.user.id, 'user not found')
  } else {
    // notify the user
    await slackBot.sendDirectMessage(user.slackId, `:-1: Admin deny your payment.`)
    let payVerify = require('./views/payVerify')
    payVerify.blocks[0].text.text = `:bank: ${user.name} want to pay`
    payVerify.blocks.splice(1, 1) // remove blocks[1]
    payVerify.blocks[1].text.text = `:+1: You has denyed this payment at ${moment().format('LLL')}`
    await respond({blocks: payVerify.blocks, replace_original: true })
  }
})

// user sumit sell form
slackInteractives.viewSubmission('sell:submit', async (payload) => {
  console.log('sell view subission', payload)
  let viewValues = payload.view.state.values

  let snackName = viewValues.snack_name.input.value
  let amount = parseInt(viewValues.snack_amount.input.value, 10)
  let totalPrice = parseInt(viewValues.snack_total_price.input.value, 10)

  if (snackName.length >= 20) {
    await slackBot.sendDirectMessage(payload.user.id, 'snackName is too long')
    return
  }
  if (isNaN(amount) || isNaN(totalPrice)) {
    await slackBot.sendDirectMessage(payload.user.id, 'amount and totalPrice must be non-negative number')
    return
  }
  if (amount <= 0 || totalPrice <= 0) {
    await slackBot.sendDirectMessage(payload.user.id, 'amount and totalPrice must be non-negative number')
    return
  }

  await sellSnacks(payload.user, snackName, amount, totalPrice)
})

// user submit money payment form
slackInteractives.viewSubmission('pay:submit', async (payload, res) => {
  console.log('pay view subission', payload)

  let viewValues = payload.view.state.values
  let moneyToPay = parseInt(viewValues.money.input.value, 10)

  if (isNaN(moneyToPay) || moneyToPay <= 0) {
    console.log('invalid money input')

    payload.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'input must be a positive number'
        }
      ]
    })
    console.log(payload.view.id, payload)
    await slackBot.sendDirectMessage(payload.user.id, 'Pay money: input must be a positive number')
  }
  await payMoney(payload.user, moneyToPay)
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
      await Snack.deleteOne({name: snack.name})
      console.log(`${snack.name} has sold out, delet from db.`)
    } else {
      // save amount
      await snack.save()
    }

    console.log(`Sold one ${snack.name} to ${user.name}, left amount: ${snack.amount}`)

    // user pay for snack
    user.balance -= snack.price
    await user.save()

    let timestamp = moment().format('LLL')
    let msg = `You pay *$NT ${price}* for one *${snackName}* at ${timestamp}.\nYour wallet has *$NT ${user.balance}* now.`
    await slackBot.sendDirectMessage(slackUser.id, msg)
    await slackBot.showHomePage(user)
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

    let price = calculatePrice(amount, totalPrice)
    let newBalance = 0

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
    await slackBot.showHomePage(user)
  }
  catch (err) {
    console.error(err)
    await slackBot.sendDirectMessage(slackUser.id, `Server error when selling snack. Please try again later.`)
  }
}

let payMoney = async (slackUser, moneyToPay) => {
  try {
    let user = await User.findOne({slackId: slackUser.id})
    if (user == null) {
      throw new Error(`user not found with slackId ${slackUser.id}`)
    }

    let admin = await User.findOne({admin: true})
    if (admin == null) {
      throw new Error(`admin not found for this workspace`)
    } else {
      let payConfirm = require('./views/payConfirm')

      payConfirm.blocks[0].text.text = `:bank: ${user.name} want to pay`
      payConfirm.blocks[1].fields[0].text = `>:dollar: *Payment*\n>$NT ${moneyToPay}`
      payConfirm.blocks[2].elements[0].value = `${user.slackId}:${moneyToPay}`
      payConfirm.blocks[2].elements[1].value = `${user.slackId}:deny`

      await slackBot.webClient.chat.postMessage({channel: admin.slackId, blocks: payConfirm.blocks})
      await slackBot.sendDirectMessage(user.slackId, 'Send notification to admin successfully, wait the admin confirm.')
    }
  }
  catch (err) {
    console.error(err)
    slackBot.sendDirectMessage(user.id, 'Server error. Please pay again later')
  }
}

let calculatePrice = (amount, totalPrice) => {
  let rawPrice = Math.round(totalPrice / amount)
  return Math.round(rawPrice / 5) * 5
}

module.exports = slackInteractives
