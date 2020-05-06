let payConfirm = {
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
					text: ':dollar: *Payment:*\n$NT 100'
				},
				{
					type: 'mrkdwn',
					text: ':calendar: *Time:*\nMar 10, 2015 (3 years, 5 months)'
				}
			]
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'button',
					action_id: 'payment:confirm',
					text: {
						type: 'plain_text',
						emoji: true,
						text: 'Confirm'
					},
					confirm: {
						title: {
							type: 'plain_text',
							text: 'Are you sure?'
						},
						text: {
							type: 'mrkdwn',
							text: 'Confirm the payment?'
						},
						confirm: {
							type: 'plain_text',
							text: 'Yes'
						}
					},
					style: 'primary',
					value: 'user:money'
				},
				{
					type: 'button',
					action_id: 'payment:deny',
					text: {
						type: 'plain_text',
						emoji: true,
						text: 'Deny'
					},
					style: 'danger',
					value: 'user:deny'
				}
			]
		}
	]
}

module.exports = payConfirm
