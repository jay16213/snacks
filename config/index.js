const path = require('path')

let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  NODE_ENV = 'development'
}

console.log(`NODE_ENV: ${NODE_ENV}`)

require('dotenv').config({path: path.resolve(__dirname, `../.env.${NODE_ENV}`)})

const config = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  SLACK_TOKEN: process.env.SLACK_TOKEN
}

module.exports = config
