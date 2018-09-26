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

		if (res.status !== 200) {
			throw new Error('Non-200 status code from API server.')
		}

		const parsedBody = await res.json()

		syncData = parsedBody
	},
	'submitScore': async (score, stats) => {
		const res = await fetch(new URL('/submitScore', apiBase).toString(), {
			'method': 'POST',
			'body': JSON.stringify({
				'username': username,
				'score': score,
				'gameVersion': version,
				'stats': stats
			})
		})

		if (res.status !== 200) {
			throw new Error('Non-200 status code from API server.')
		}
	},
	'getHighScores': async () => {
		const highscoreURL = new URL('/getHighScores', apiBase)

		highscoreURL.searchParams.set('version', version)

		const res = await fetch(highscoreURL.toString(), {
			'method': 'POST'
		})

		if (res.status !== 200) {
			throw new Error('Non-200 status code from API server.')
		}

		const parsedBody = await res.json()

		return parsedBody
	}
}