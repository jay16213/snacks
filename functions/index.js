const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
let region = 'asia-northeast1';
let db = admin.firestore();

exports.buySnack = functions.region(region).https.onRequest((req, res) => {
  // https://api.slack.com/legacy/message-buttons
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

exports.newTransaction = functions.region(region).https.onRequest((req, res) => {
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

exports.checkWallet = functions.region(region).https.onRequest((req, res) => {
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
        let timestamp = Date.now()
        res.status(200).send(`Your wallet has $NT ${walletDoc.data().balance}. ${timestamp}`)
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(error, err)
    })
})

exports.sellSnack = functions.region(region).https.onRequest((req, res) => {
  let slackInteractiveRes = {
    'type': 'modal',
    'title': {
      'type': 'plain_text',
      'text': 'Sell snack',
      'emoji': true
    },
    'callback_id': 'transaction_sell',
    'blocks': [
      {
        'block_id': 'snack_name',
        'label': {
          'type': 'plain_text',
          'text': 'Snack name'
        },
        'type': 'input',
        'element': {
          'type': 'plain_text_input',
          'action_id': 'title',
          'placeholder': {
            'type': 'plain_text',
            'text': 'What do you want to sell?'
          }
        }
      },
      {
        'block_id': 'amount',
        'label': {
          'type': 'plain_text',
          'text': 'Amount'
        },
        'type': 'input',
        'element': {
          'type': 'plain_text_input',
          'action_id': 'option_1',
          'placeholder': {
            'type': 'plain_text',
            'text': 'the number of item'
          }
        }
      },
      {
        'block_id': 'total_price',
        'label': {
          'type': 'plain_text',
          'text': 'Total price (The bot will calculate the unit price automatically)'
        },
        'type': 'input',
        'element': {
          'type': 'plain_text_input',
          'action_id': 'option_2',
          'placeholder': {
            'type': 'plain_text',
            'text': 'total price'
          }
        }
      }
    ],
    'submit': {
      'type': 'plain_text',
      'text': 'Submit',
      'emoji': true
    },
    'close': {
      'type': 'plain_text',
      'text': 'Cancel',
      'emoji': true
    }
  }

  res.status(200).json(slackInteractiveRes)
})

let newBuyTransaction = ((payload, res) => {
  // payload format: https://api.slack.com/legacy/message-buttons
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

let newSellTransaction = ((payload, res) => {
  let user = payload.user
  let submitValues = payload.state.values
  let snack = {
    name: submitValues.snack_name,
    amount: submitValues.amount,
    price: submitValues.total_price // init price with total price, update later
  }

  // first, find a user
  let walletRef = db.collection('wallets').doc(user.id)
  walletRef.get()
    .then(walletDoc => {
      // only an existing user can sell snacks
      if (!walletDoc.exists) {
        res.send('You cannot sell snacks!')
      } else {
        unitPrice = snack.price / amount
        // snack.pr
        db.collection('store').doc(snack.name).set({
          name: snack.name,
          amount: snack.amount,
          price: snack.price
        })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(error, err)
    })
})
