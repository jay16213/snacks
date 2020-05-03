const webApi = require('@slack/web-api')
const User = require('../models/user')
const Snack = require('../models/snack')

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
          text: `Your wallet: $NT ${user.balance}`,
          color: '#3AA3E3',
          actions: actions
        }]
      }).then(() => {
        console.log('show menu successfully')
      }).catch(err => {
        console.error(err)
      })
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
    console.log(message)
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
