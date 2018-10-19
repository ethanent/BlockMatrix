;(async() => {
	document.querySelector('#copyright').style.display = 'none'

	await poky(100)

	document.querySelector('#splash > img').style.webkitTransform = 'rotate3d(1, 1, 1, 360deg)'

	await poky(2000)

	document.querySelector('#splash').style.display = 'none'

	const canSkipLogin = await api.canSkipLogin()

	if (canSkipLogin) {
		console.log('Server authorized login skip. Skipping authentication.')

		document.querySelector('#status').style.display = 'block'

		await api.login(username, null)

		document.querySelector('#status').style.display = 'none'
		document.querySelector('#game').style.display = 'block'

		startGame()
	}
	else {
		console.log('Server did not authorize login skip. Starting user login process.')

		document.querySelector('#login').style.display = 'block'

		if (username.includes('.')) {
			document.querySelector('#username').value = username

			document.querySelector('#password').focus()
		}
		else document.querySelector('#username').focus()
	}
})()

const loginStep = async () => {
	document.querySelector('#login').style.display = 'none'
	document.querySelector('#status').style.display = 'block'

	try {
		await api.login(document.querySelector('#username').value, document.querySelector('#password').value)
	}
	catch (err) {
		document.querySelector('#status').style.display = 'none'

		alert(err.message)

		document.querySelector('#password').value = ''

		document.querySelector('#login').style.display = 'block'

		document.querySelector('#password').focus()

		return
	}

	document.querySelector('#password').value = ''

	document.querySelector('#status').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	startGame()
}

document.querySelector('#loginButton').onclick = loginStep

document.querySelector('#password').onkeypress = (event) => {
	if (event.key === 'Enter') loginStep()
}

//startGame()

const gameEnded = async () => {
	playSoundEffect('death.wav')

	let {score} = gameState

	syncData.gamesPlayed++

	await poky(1000)

	document.body.style.backgroundColor = '#F2F2F0'

	console.log('Game over! Score: ' + score)

	document.querySelector('#status > h1').textContent = 'Hold on.'
	document.querySelector('#status > h2').textContent = 'Uploading game data...'

	document.querySelector('#game').style.display = 'none'
	document.querySelector('#status').style.display = 'block'
	document.querySelector('#copyright').style.display = 'block'

	gameState.stats.duration = Math.round(performance.now() - gameState.started)

	try {
		await api.submitScore(score, gameState.stats)
	}
	catch (err) {
		console.error(err)

		document.querySelector('#status > h1').textContent = 'Error'
		document.querySelector('#status > h2').textContent = 'Failed to upload game data.'

		await poky(1200)
	}

	document.querySelector('#status').style.display = 'none'
	document.querySelector('#score').style.display = 'block'

	if (score > syncData.highscore) {
		syncData.highscore = score

		playSoundEffect('highscore.wav')

		document.querySelector('#score > h1').textContent = score

		document.querySelector('#score > h2').textContent = 'That\'s a new highscore!'
	}
	else {
		document.querySelector('#score > h1').textContent = score

		document.querySelector('#score > h2').textContent = 'Your highscore is ' + syncData.highscore + '.'
	}

	document.querySelector('#score > p').textContent = 'You\'ve played ' + syncData.gamesPlayed + ' games.'

	await poky(2000)

	document.querySelector('#score').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	document.querySelector('#copyright').style.display = 'none'

	startGame()
}