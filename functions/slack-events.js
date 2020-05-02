const slackEventsApi = require('@slack/events-api')

// slack event api
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET)

slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)
})

module.exports = slackEvents
