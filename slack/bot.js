const webApi = require('@slack/web-api')
const Snack = require('../models/snack')

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN
const web = new webApi.WebClient(token)

const bot = {
  showSnackMenu(channel) {
    Snack.find({}, (err, snacks) => {
      if (err) {
        console.error(err)
        this.sendDirectMessage(channel, `Server error when get snacks list`)
        return
      }

      let actions = []
      snacks.forEach(snack => {
        actions.push({
          'name': 'snack',
          'text': `${snack.name} ($NT ${snack.price})`,
          'type': 'button',
          'value': snack.price,
          'confirm': {
            'title': 'Are you sure?',
            'text': `Are you want to buy a ${snack.name}?`,
            'ok_text': 'Yes',
            'dismiss_text': 'No'
          }
        })
      })

      web.chat.postMessage({
        channel: channel,
        text: 'Do you want to buy snacks?',
        attachments: [{
          text: 'Choose a snack',
          color: '#3AA3E3',
          actions: actions
        }]
      }).then(() => {
        console.log('show menu successfully')
      }).catch(err => {
        console.error(err)
      })
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
    this.showSnackMenu(message.channel)
  }
}

module.exports = bot
