const express = require('express')
const indexRouter = require('./routes')
const slackEvents = require('./slack/events')
const slackInteractives = require('./slack/interactive')
const normalizePort = require('normalize-port')

// mongodb
const mongoose = require('mongoose')

// database setup
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/snacks-store', { useUnifiedTopology: true, useNewUrlParser: true })

// express
const port = normalizePort(process.env.PORT || '3000');
const app = express()

app.use('/', indexRouter)
app.use('/slack/events', slackEvents.expressMiddleware())
app.use('/slack/actions', slackInteractives.expressMiddleware())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.listen(port, () => {
    console.log(`Slack server is listening on port ${port}`)
})
