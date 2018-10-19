const {URL} = require('url')
const c = require('centra')

const api = {
	'login': async (username, password) => {
		console.log('Logging in ' + password)

		const res = await c(apiBase, 'POST').path('/login').timeout(6000).body({
			'username': username,
			'password': password,
			'system': {
				'platform': os.platform(),
				'uptime': os.uptime(),
				'memory': os.totalmem()
			},
			'gameVersion': version
		}).send()

		if (res.statusCode === 401) {
			throw new Error('Your student login credentials were incorrect.')
		}
		else if (res.statusCode !== 200) {
			throw new Error('Non-200 status code from API server. ' + res.statusCode)
		}
		else console.log('Logged in successfully!')

		const parsedBody = await res.json()

		syncData = parsedBody
	},
	'submitScore': async (score, stats) => {
		const res = await c(apiBase, 'POST').path('/submitScore').timeout(6000).body({
			'token': syncData.token,
			'score': score,
			'gameVersion': version,
			'stats': stats
		}).send()

		if (res.statusCode !== 200) {
			throw new Error('Non-200 status code from API server.')
		}
		else console.log('Submitted game to server successfully!')
	},
	'getHighScores': async () => {
		const res = await c(apiBase, 'POST').path('/getHighScores').timeout(6000).query('version', version).send()

		if (res.statusCode !== 200) {
			throw new Error('Non-200 status code from API server.')
		}
		else console.log('Retrieved high scores successfully!')

		const parsedBody = await res.json()

		return parsedBody
	},
	'getUserStats': async (id) => {
		const res = await c(apiBase, 'POST').path('/fetchUserStats').body({
			'id': id
		}).send()

		if (res.statusCode !== 200) {
			throw new Error('Non-200 status from API server.')
		}
		else console.log('Retrieved user stats successfully!')

		const parsedBody = await res.json()

		return parsedBody
	},
	'getStats': async () => {
		const res = await c(apiBase, 'POST').path('/fetchStats').send()

		return await res.json()
	}
}