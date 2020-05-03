const slackInteractiveMessages = require('@slack/interactive-messages')
const moment = require('moment')
const Snack = require('../models/snack')
const User = require('../models/user')
const slackBot = require('./bot')

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET

// init slack tools
const slackInteractives = slackInteractiveMessages.createMessageAdapter(slackSigningSecret)

// handle a button interactive message
slackInteractives.action({type: 'button'}, (payload, res) => {
  console.log('receive button action')
  console.log(payload)

  let user = payload.user
  let trigger_id = payload.trigger_id
  let channel_id = payload.container.channel_id
  let action = payload.actions[0]

  if (action.action_id.startsWith('buy')) {
    console.log('buy action')
    console.log(action.text, action.value)
    snackName = String(action.text.text).split(' ')[0]
    price = parseInt(action.value)
    buySnacks(user.id, channel_id, snackName, price)
  } else if (action.action_id.startsWith('sell')) {
    console.log('sell action')
    console.log(action.text, action.value)
    slackBot.showSellModal(trigger_id)
  } else {
    console.error(`Unknown action_id ${action.action_id}`)
  }
})

slackInteractives.viewSubmission('sell-submit', (payload) => {
  console.log('sell view subission', payload)
  let viewValues = payload.view.state.values

  let snackName = viewValues.snack_name.input.value
  let amount = parseInt(viewValues.snack_amount.input.value)
  let totalPrice = parseInt(viewValues.snack_total_price.input.value)
  console.log(viewValues)
  console.log(snackName, amount, totalPrice)
  Snack.exists({name: viewValues.snack_name.value}, (err, exists) => {
    if (err) {
      console.error(err)
      return
    }

    if (exists) {
      slackBot.sendDirectMessage(payload.user.id, `${viewValues.snack_name} has existed at store, you can't not sell the same thing until it sold out.`)
    } else {
      sellSnacks(payload.user, snackName, amount, totalPrice)
    }
  })
})

let buySnacks = (user_id, channel_id, snackName, price) => {
  Snack.findOne({name: snackName}, (err, snack) => {
    if (err) {
      console.error(err)
      slackBot.sendDirectMessage(channel_id, `Can't not buy ${snackName}`)
      return
    }

    User.findOne({id: user_id}, (err, user) => {
      if (err) {
        console.error(`Can't not find user with id ${user_id}`)
        return
      }

      snack.amount--
      if (snack.amount == 0) {
        Snack.delete(snack).then(() => {
          console.log(`${snack.name} has sold out, delet from db.`)
        }).catch(err => {
          console.error(err)
        })
      } else {
        snack.save().then(() => {
          console.log(`${snack.name} amount: ${snack.amount}`)
          user.balance -= snack.price
          user.save().then(() => {
            let timestamp = moment().format('LLL')
            let msg = `You buy a ${snack.name} at ${timestamp}. Your wallet has $NT ${user.balance} now`
            slackBot.sendDirectMessage(channel_id, msg)
          }).catch(err => {
            console.error(err)
          })
        }).catch(err => {
          console.error(err)
        })
      }
    })
  })
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
