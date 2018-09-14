const {URL} = require('url')

const api = {
	'login': async () => {
		const res = await fetch(new URL('/login', apiBase).toString(), {
			'method': 'POST',
			'body': JSON.stringify({
				'username': username,
				'system': {
					'platform': os.platform(),
					'uptime': os.uptime(),
					'memory': os.totalmem()
				},
				'gameVersion': version
			})
		})

		if (res.statusCode !== 200) {
			throw new Error('Non-200 status code from API server.')
		}

		const parsedBody = await res.json()

		syncData.highscore = parsedBody.highscore
		syncData.returningPlayer = parsedBody.returningPlayer
	},
	'submitScore': async (score) => {
		const res = await fetch(new URL('/submitScore', apiBase).toString(), {
			'method': 'POST',
			'body': JSON.stringify({
				'username': username,
				'score': score,
				'gameVersion': version
			})
		})

		if (res.statusCode !== 200) {
			throw new Error('Non-200 status code from API server.')
		}
	}
}