;(async() => {
	const highscores = await api.getHighScores()

	highscores.forEach((highscore) => {
		const parsedUsername = parseUsername(highscore.username)

		const combinedName = parsedUsername[0] + ' ' + (parsedUsername[1] || '')

		const userLink = sy('a', {'href': '#userprofile', 'draggable': 'false'}, [combinedName])

		userLink.onclick = async () => {
			const userInfo = await api.getUserStats(highscore.username)

			document.querySelector('#highscores').style.display = 'none'
			document.querySelector('#userinfo').style.display = 'block'

			document.querySelector('#userinfo_name').textContent = combinedName
			document.querySelector('#userinfo_joined').textContent = 'joined ' + userInfo.joined
			
			document.querySelector('#stats').innerHTML = ''

			userInfo.stats.forEach((stat) => {
				document.querySelector('#stats').appendChild(sy('p', {}, [stat.title + ': ' + stat.value]))
			})
		}

		document.querySelector('#renderScores').appendChild(sy('div', {'class': 'highscore'}, [sy('strong', {}, [highscore.score.toString()]), userLink]))
	})
})()

document.querySelector('#back').onclick = () => {
	document.querySelector('#userinfo').style.display = 'none'
	document.querySelector('#highscores').style.display = 'block'
}