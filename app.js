const express = require('express')
const slackEvents = require('./slack/events')
const slackInteractives = require('./slack/interactive')
const normalizePort = require('normalize-port')
const config = require('./config')
// mongodb
const mongoose = require('mongoose')

// database setup
mongoose.Promise = global.Promise
mongoose.connect(config.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (err) {
        console.error('Error occurred while connecting to DB: ', err)
    } else {
        console.log('DB connection established successfully')
    }
})

// express
const port = normalizePort(config.PORT);
const app = express()

app.use('/slack/events', slackEvents.expressMiddleware())
app.use('/slack/actions', slackInteractives.expressMiddleware())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.listen(port, () => {
    console.log(`Slack server is listening on port ${port}`)
})
