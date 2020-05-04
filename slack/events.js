const slackEventsApi = require('@slack/events-api')
const slackBot = require('./bot')
const User = require('../models/user')

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET

// init slack tools
const slackEvents = slackEventsApi.createEventAdapter(slackSigningSecret)

slackEvents.on('message', (event) => {
  console.log('message event: ', event)
  // Filter out messages from this bot itself or updates to messages
  if (event.bot_id != null || event.type == 'message_changed') {
    return
  }

  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)
  slackBot.handleDirectMessage(event)
})

// https://api.slack.com/events/app_home_opened
slackEvents.on('app_home_opened', async (event) => {
  console.log('app home open event', event)

  try {
    let user = await User.findOne({slackId: event.user})

    // the user use this app first time
    if (user == null) {
      let newUser = new User()
      newUser.slackId = event.user
      newUser.admin = false
      newUser.balance = 0

      try {
        let slackUserInfo = await slackBot.webClient.users.info({user: event.user})
        console.debug(slackUserInfo)

        newUser.name = slackUserInfo.user.profile.display_name
        newUser.save().then(async () => {
          await slackBot.sendDirectMessage(event.channel, 'Welcome to Snack store! I create a wallet with *$NT 0* for you')
          await slackBot.showHomePage(newUser)
        }).catch(err => {
          console.error(err)
        })
      }
      catch (err) {
        console.error(err)
      }
    } else {
      await slackBot.showHomePage(user)
    }
  }
  catch (err) {
    console.error(err)
  }
})

module.exports = slackEvents
