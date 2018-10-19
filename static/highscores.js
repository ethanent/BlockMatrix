;(async() => {
	const highscores = await api.getHighScores()

	highscores.forEach((highscore) => {
		const userLink = sy('a', {'href': '#userprofile', 'draggable': 'false'}, [highscore.name])

		userLink.onclick = async () => {
			const userInfo = await api.getUserStats(highscore.id)

			document.querySelector('#userinfo_tags').innerHTML = ''

			document.querySelector('#highscores').style.display = 'none'
			document.querySelector('#userinfo').style.display = 'block'

			document.querySelector('#userinfo_name').textContent = highscore.name

			userInfo.tags.forEach((tag) => {
				const tagElement = sy('p', {'class': 'userinfo_tag'}, [tag.title])

				tagElement.style.color = tag.color
				tagElement.style.borderColor = tag.color

				document.querySelector('#userinfo_tags').appendChild(tagElement)
			})

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