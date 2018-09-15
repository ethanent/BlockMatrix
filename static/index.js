;(async() => {
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

	await poky(700)

	console.log('Game over! Score: ' + score)

	document.querySelector('#status > h1').textContent = 'Hold on.'

	document.querySelector('#game').style.display = 'none'
	document.querySelector('#status').style.display = 'block'
	document.querySelector('#copyright').style.display = 'block'

	try {
		await api.submitScore(score)
	}
	catch (err) {
		console.error(err)

		document.querySelector('#status > h1').textContent = 'Error'
		document.querySelector('#status > h2').textContent = 'Failed to submit score.'

		await poky(800)
	}

	await poky(400)

	document.querySelector('#status').style.display = 'none'
	document.querySelector('#score').style.display = 'block'

	if (score > syncData.highscore) {
		syncData.highscore = score

		playSoundEffect('highscore.wav')

		document.querySelector('#score > h1').textContent = 'New highscore!'

		document.querySelector('#score > h2').textContent = 'You scored ' + syncData.highscore + '.'
	}
	else {
		document.querySelector('#score > h1').textContent = 'You scored ' + score + '.'

		document.querySelector('#score > h2').textContent = 'Your highscore is ' + syncData.highscore + '.'
	}

	await poky(2000)

	document.querySelector('#score').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	document.querySelector('#copyright').style.display = 'none'

	startGame()
}