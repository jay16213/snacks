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

  switch (action.action_id) {
    case 'buy':
      console.log('buy action')
      console.log(action.text, action.value)

      snackName = String(action.text.text).split(' ')[0]
      price = parseInt(action.value)

      buySnacks(user.id, channel_id, snackName, price)
      break
    case 'sell':
      console.log('sell action')
      console.log(action.text, action.value)
      break
    default:
      console.error(`Unknown action_id ${action.action_id}`)
      break
  }
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

module.exports = slackInteractives
