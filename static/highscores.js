;(async() => {
	const highscores = await api.getHighScores()

	highscores.forEach((highscore) => {
		const parsedUsername = parseUsername(highscore.username)

		const combinedName = parsedUsername[0] + ' ' + (parsedUsername[1] || '')

		const userLink = sy('a', {'href': '#userprofile', 'draggable': 'false'}, [combinedName])

		userLink.onclick = async () => {
			document.querySelector('#highscores').style.display = 'none'

			const userInfo = await api.getUserStats(highscore.username)

			document.querySelector('#userinfo').style.display = 'block'

			document.querySelector('#userinfo_name').textContent = combinedName
			document.querySelector('#userinfo_joined').textContent = 'joined ' + userInfo.joined
			document.querySelector('#userinfo_highscore').textContent = 'High score: ' + highscore.score
			document.querySelector('#userinfo_gamesPlayed').textContent = 'Games played: ' + userInfo.gamesPlayed
			document.querySelector('#userinfo_average').textContent = 'Average score: ' + userInfo.averageScore
		}

		document.querySelector('#renderScores').appendChild(sy('div', {'class': 'highscore'}, [sy('strong', {}, [highscore.score.toString()]), userLink]))
	})
})()

document.querySelector('#back').onclick = () => {
	document.querySelector('#userinfo').style.display = 'none'
	document.querySelector('#highscores').style.display = 'block'
}