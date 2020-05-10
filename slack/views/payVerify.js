let payVerify = {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':bank: User want to pay'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '>:dollar: *Payment*\n>$NT 100'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':+1: You has verified this payment at time'
      }
    }
  ]
}

module.exports = payVerify
