let payConfirm = {
  blocks: [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'Username want to pay NT$ money'
			},
			accessory: {
				type: 'button',
				action_id: 'pay:confirm',
				text: {
					type: 'plain_text',
					text: 'Confirm',
					emoji: true
				},
				style: 'primary',
				value: 'user:money'
			}
		}
	]
}

module.exports = payConfirm
