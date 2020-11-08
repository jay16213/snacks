const path = require('path')

let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  NODE_ENV = 'development'
}

console.log(`NODE_ENV: ${NODE_ENV}`)

require('dotenv').config({path: path.resolve(__dirname, `../.env.${NODE_ENV}`)})

const config = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_TOKEN: process.env.SLACK_TOKEN
}

module.exports = config
