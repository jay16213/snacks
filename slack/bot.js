const webApi = require('@slack/web-api')
const User = require('../models/user')
const Snack = require('../models/snack')
const sellModal = require('./sell-modal')

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN
const web = new webApi.WebClient(token)

const bot = {
  showSnackMenu(channel, user) {
    Snack.find({}, (err, snacks) => {
      if (err) {
        console.error(err)
        this.sendDirectMessage(channel, `Server error when get snacks list`)
        return
      }

      let blocks = [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Your wallet: $NT ${user.balance}`
        }
      }, {
        type: 'divider',
      }, {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Want to buy snacks?'
        }
      }, {
        type: 'actions',
			  elements: []
      }]

      snacks.forEach(snack => {
        blocks[3].elements.push({
          type: 'button',
          action_id: `buy-${snack.name}`,
          text: {
            type: 'plain_text',
            text: `${snack.name} ($NT ${snack.price})`,
          },
          value: `${snack.price}`,
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

      blocks.push({type: 'divider'})
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Want to sell snacks?'
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Sell snack'
          },
          value: 'sell',
          style: 'primary',
          action_id: 'sell'
        }
      })

      web.chat.postMessage({
        channel: channel,
        blocks: blocks
      }).then(() => {
        console.log('show menu successfully')
      }).catch(err => {
        console.error(err)
      })
    }).catch(err => {
      console.error(err)
    })
  },

  showSellModal(trigger_id) {
    web.views.open({
      trigger_id: trigger_id,
      view: sellModal
    }).then((res) => {
      console.log('open modal success, ', res, res.view.blocks)
    }).catch(err => {
      console.error(err)
    })
  },

  sendDirectMessage(channel, text) {
    web.chat.postMessage({
      channel: channel,
      text: text,
    }).then(() => {
      console.log(`write message to channel ${channel} successfully.`)
    }).catch(err => {
      console.error(err)
    })
  },

  handleDirectMessage(message) {
    User.findOne({id: message.user}, (err, user) => {
      if (err) {
        console.error(err)
        this.sendDirectMessage(channel, `Server error when get snacks list`)
        return
      }

      if (user == null) {
        let newUser = new User()
        newUser.id = message.user
        newUser.balance = 0

        newUser.save(err => {
          if (err) {
            console.error(err)
            return
          }
          this.sendDirectMessage(message.channel, 'This is your first time to use Snack bot. I create a wallet with $NT 0 for you.')
          this.showSnackMenu(message.channel, newUser)
        })
      } else {
        this.showSnackMenu(message.channel, user)
      }
    })
  }
}

module.exports = bot
