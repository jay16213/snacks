let sellModal = {
	"type": "modal",
	"callback_id": "sell-submit",
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
					"text": "the number of snacks"
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
			"hint": {
            	"type": "plain_text",
                "text": "The bot will calculate the unit price automatically"
            },
			"label": {
				"type": "plain_text",
				"text": "Total price"
			}
		}
	]
}

module.exports = sellModal
