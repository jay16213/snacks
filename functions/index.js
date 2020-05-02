const functions = require('firebase-functions')
// const admin = require('firebase-admin')
const express = require('express')
const indexRouter = require('./routes')
const slackEvents = require('./slack-events')

// deploy to tokyo
const region = 'asia-northeast1'

// express
const app = express()
app.use('/', indexRouter)
app.use('/slack/events', slackEvents.expressMiddleware())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

exports.snacksApi = functions.region(region).https.onRequest(app)
