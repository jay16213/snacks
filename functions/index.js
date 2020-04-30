const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
let db = admin.firestore();

exports.getSnacks = functions.https.onRequest((req, res) => {
  // https://api.slack.com/legacy/message-buttons
  let slackInteractiveRes = {
    'text': 'Would you like to buy a snack?',
    'callback_id': 'buy_snack',
    'fallback': 'Would you like to buy a snack?',
    'attachments': [{
      'text': 'Choose a snack',
      'color': '#3AA3E3',
      'callback_id': 'buy_snack',
      'attachment_type': 'default',
      'actions': []
    }]
  }

  db.collection('store').get()
    .then(snacks => {
      snacks.forEach(snackDoc => {
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
    })
    .catch(err => {
      res.status(404).send('Sorry, I cannot get the list of snacks')
    })
})

exports.buySnack = functions.https.onRequest((req, res) => {
  let payload = JSON.parse(req.body.payload)
  console.log(payload)

  let user = payload.user
  let payment = parseInt(payload.actions[0].value)

  console.log(user)
  console.log(payload.actions)
  console.log(payment)

  let walletRef = db.collection('wallets').doc(user.id)
  walletRef.get()
    .then(wallet => {
      // if there is a new user -> create a new wallet
      if (!wallet.exists) {
        let newBalance = 0 - payment
        walletRef.set({
          'id': user.id,
          'name': user.name,
          'balance': newBalance
        }).then(() => {
          res.status(200).send(`You are a new user! Your wallet has $NT ${newBalance} now.`)
        }).catch(err => {
          res.status(500).json(error, err)
        })
      } else {
      // existing user -> udpate wallet
        let newBalance = wallet - payment
        walletRef.update({
          'balance': newBalance
        }).then(() => {
          res.status(200).send(`Done. Your wallet has $NT ${newBalance} now.`)
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
