const admin = require('firebase-admin')
const express = require('express')
const http = require('http')
const router = express.Router()

// firebase initialization
admin.initializeApp()
const db = admin.firestore()

// handle '/buy' at slack
router.post('/buy', (req, res) => {
  let slackInteractiveRes = {
    'text': 'Would you like to buy a snack?',
    'callback_id': 'new_transaction',
    'fallback': 'Would you like to buy a snack?',
    'attachments': [{
      'text': 'Choose a snack',
      'color': '#3AA3E3',
      'callback_id': 'new_transaction',
      'attachment_type': 'default',
      'actions': []
    }]
  }

  db.collection('store').get()
    .then(snapshot => {
      if (snapshot.empty) {
        res.status(200).send('Oops! There is no snacks')
      } else {
        snapshot.forEach(snackDoc => {
          let snack = snackDoc.data()
          slackInteractiveRes.attachments[0].actions.push({
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
        res.status(200).json(slackInteractiveRes)
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).send('Sorry, I cannot get the list of snacks')
    })
})

router.post('/transaction', (req, res) => {
  let payload = JSON.parse(req.body.payload)
  let user = payload.user
  let payment = parseInt(payload.actions[0].value)

  let walletRef = db.collection('wallets').doc(user.id)
  walletRef.get()
    .then(walletDoc => {
      // if there is a new user -> create a new wallet
      if (!walletDoc.exists) {
        let newBalance = 0 - payment
        walletRef.set({
          'id': user.id,
          'name': user.name,
          'balance': newBalance
        }).then(() => {
          res.status(200).send(`You are a new user to use Snack bot! Your wallet has $NT ${newBalance} now.`)
        }).catch(err => {
          res.status(500).json(error, err)
        })
      } else {
      // existing user -> udpate wallet
        let newBalance = walletDoc.data().balance - payment
        walletRef.update({
          'balance': newBalance
        }).then(() => {
          res.status(200).send(`Done. You pay $NT${payment}. Your wallet has $NT ${newBalance} now.`)
        }).catch(err => {
          console.log(err)
          res.status(500).json(error, err)
        })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(error, err)
    })
})

// handle '/wallet' at slack
router.post('/wallet', (req, res) => {
  let user_id = req.body.user_id
  let user_name = req.body.user_name
  let walletRef = db.collection('wallets').doc(user_id)
  walletRef.get()
    .then(walletDoc => {
      // if there is a new user -> create a new wallet
      if (!walletDoc.exists) {
        walletRef.set({
          'id': user_id,
          'name': user_name,
          'balance': 0
        }).then(() => {
          res.status(200).send(`This is your first time to use Snack bot! Create a wallet with $NT 0 for you.`)
        }).catch(err => {
          res.status(500).json(error, err)
        })
      } else {
        // existing user -> return balance
        res.status(200).send(`Your wallet has $NT ${walletDoc.data().balance}`)
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(error, err)
    })
})

module.exports = router
