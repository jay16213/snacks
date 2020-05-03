const slackEventsApi = require('@slack/events-api')
const slackBot = require('./bot')

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET

// init slack tools
const slackEvents = slackEventsApi.createEventAdapter(slackSigningSecret)

slackEvents.on('message', (event) => {
    // Filter out messages from this bot itself or updates to messages
    if (event.bot_id != null || event.type == 'message_changed') {
        return
    }

    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)
    slackBot.handleDirectMessage(event)
})

module.exports = slackEvents
