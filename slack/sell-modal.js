let sellModal = {
	"type": "modal",
	"title": {
		"type": "plain_text",
		"text": "Sell snack",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"block_id": "12345",
			"label": {
				"type": "plain_text",
				"text": "Snack Name"
			},
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "snack_name",
				"placeholder": {
					"type": "plain_text",
					"text": "What do you want to sell?"
				}
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "snack_amount",
				"placeholder": {
					"type": "plain_text",
					"text": "the number of item"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "Amount"
			}
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "snack_total_price",
				"placeholder": {
					"type": "plain_text",
					"text": "total price"
				}
			},
			"label": {
				"type": "plain_text",
				"text": "Total price (The bot will calculate the unit price automatically)"
			}
		}
	]
}

module.exports = sellModal
