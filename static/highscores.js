;(async() => {
	const highscores = await api.getHighScores()

	highscores.forEach((highscore) => {
		const parsedUsername = parseUsername(highscore.username)

		document.querySelector('#renderScores').appendChild(sy('div', {'class': 'highscore'}, [sy('strong', {}, [highscore.score.toString()]), sy('p', {}, [parsedUsername[0] + ' ' + (parsedUsername[1] || '')])]))
	})
})()