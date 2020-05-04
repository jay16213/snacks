const webApi = require('@slack/web-api')
const moment = require('moment')
const User = require('../models/user')
const Snack = require('../models/snack')
const sellModal = require('./views/sellModal')
const config  = require('../config.json')

// An access token (from your Slack app or custom integration - xoxp, xoxb)
let webClient = new webApi.WebClient(config.slackToken)

module.exports = {
  webClient: webClient,

  showSellModal: async (trigger_id) => {
    try {
      await webClient.views.open({
        trigger_id: trigger_id,
        view: sellModal
      })
    }
    catch (err) {
      console.error(err)
    }
  },

  sendDirectMessage: async (channel, text) => {
    try {
      await webClient.chat.postMessage({channel: channel, text: text})
      console.log(`write message to channel ${channel} successfully.`)
    }
    catch (err) {
      console.error(err)
    }
  },

  showHomePage: async (user) => {
    let viewPayload = require('./views/home')

    // show user's wallet and timestamp
    viewPayload.blocks[0].text.text = `You wallet has *$NT ${user.balance}*`
    viewPayload.blocks[1].elements[0].text = `_last updated: ${moment().format('LLL')}_`
    try {
      let snacks = await Snack.find()
      if (snacks.length <= 0) {
        viewPayload.blocks[4] = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'There are no snack are sold now.'
          }
        }
      } else {
        viewPayload.blocks[4].elements = [] // clear the array
        snacks.forEach(snack => {
          viewPayload.blocks[4].elements.push({
            type: 'button',
            action_id: `buy:${snack.name}`,
            text: {
              type: 'plain_text',
              text: `${snack.name} | $NT ${snack.price}`,
              emoji: true
            },
            value: `${snack.name}:${snack.price}`,
            confirm: {
              title: {
                type: 'plain_text',
                text: 'Are you sure?',
              },
              text: {
                type: 'mrkdwn',
                text: `Do you want to buy a ${snack.name}?`
              },
              confirm: {
                type: 'plain_text',
                text: 'Yes'
              },
              deny: {
                'type': 'plain_text',
                'text': 'No'
              }
            }
          })
        })
      }
    } catch (err) {
      console.error(err)
      viewPayload.blocks[4] = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'There are no snack are sold now.'
        }
      }
    }

    try {
      console.log('view payload', viewPayload)
      await webClient.views.publish({user_id: user.slackId, view: viewPayload})
    }
    catch (err) {
      console.error(err)
    }
  }
}
