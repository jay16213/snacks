let payModal = {
	"type": "modal",
	"callback_id": "pay:submit",
	"title": {
		"type": "plain_text",
		"text": "Pay",
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
			"block_id": "money",
			"type": "input",
			"label": {
				"type": "plain_text",
				"text": "How much you want to pay?"
			},
			"element": {
				"type": "plain_text_input",
				"action_id": "input",
				"placeholder": {
					"type": "plain_text",
					"text": "money"
				}
			}
		}
	]
}

module.exports = payModal
