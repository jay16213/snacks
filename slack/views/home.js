let home = {
  type: 'home',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'You wallet has *$NT ${user.balance}*'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'last updated: time'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'Want to buy snacks?',
        emoji: true
      }
    },
    {
      type: 'actions',
      elements: []
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Want to sell snacks?'
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Sell snacks',
          emoji: true
        },
        style: 'primary',
        value: 'sell'
      }
    }
  ]
}

module.exports = home
