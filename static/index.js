;(async() => {
	await poky(100)

	document.querySelector('#splash > img').style.webkitTransform = 'rotate3d(1, 1, 1, 360deg)'

	await poky(2000)

	document.querySelector('#splash').style.display = 'none'
	
	document.querySelector('#status').style.display = 'block'

	console.log('Logging in!')

	let loginRes

	try {
		loginRes = await api.login()
	}
	catch (err) {
		console.error(err)

		document.querySelector('#status > h1').textContent = 'Error'
		document.querySelector('#status > h2').textContent = 'Failed to login to BlockMatrix server.'

		await poky(800)
	}

	if (syncData.returningPlayer) {
		document.querySelector('#status > h1').textContent = 'Welcome back, ' + name[0] + '.'
	}
	else document.querySelector('#status > h1').textContent = 'Welcome, ' + name[0] + '.'

	await poky(1000)

	document.querySelector('#status').style.display = 'none'
	document.querySelector('#copyright').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	startGame()
})()

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

		await poky(800)
	}

	await poky(800)

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