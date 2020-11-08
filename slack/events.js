const slackEventsApi = require('@slack/events-api')
const slackBot = require('./bot')
const config  = require('../config')
const User = require('../models').User

// init slack tools
const slackEvents = slackEventsApi.createEventAdapter(config.SLACK_SIGNING_SECRET)

// https://api.slack.com/events/app_home_opened
slackEvents.on('app_home_opened', async (event) => {
  console.log('app home open event', event)

  try {
    let user = await User.findOne({where: {slackID: event.user}})

    // the user use this app first time
    if (user == null) {
      try {
        let slackUserInfo = await slackBot.webClient.users.info({user: event.user})
        console.debug(slackUserInfo)

        User.create({
          slackID: event.user,
          name: slackUserInfo.user.profile.display_name || slackUserInfo.user.profile.real_name,
          isAdmin: false,
          balance: 0,
        }).then(async (newUser) => {
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
