document.querySelector('#status > h1').textContent = 'Welcome, ' + name[0] + '.'

;(async() => {
	document.querySelector('#status').style.display = 'none'
	document.querySelector('#copyright').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	let loginRes

	try {
		loginRes = await api.login()
	}
	catch (err) {
		document.querySelector('#status > h1').textContent = 'Error'
		document.querySelector('#status > h2').textContent = 'Failed to login to BlockMatrix server.'

		await poky(800)
	}

	await poky(400)

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
		document.querySelector('#status > h1').textContent = 'Error'
		document.querySelector('#status > h2').textContent = 'Failed to submit score.'

		await poky(800)
	}

	await poky(400)

	document.querySelector('#status').style.display = 'none'
	document.querySelector('#score').style.display = 'block'

	if (score > syncData.highScore) {
		syncData.highScore = score

		playSoundEffect('highscore.wav')

		document.querySelector('#score > h1').textContent = 'New highscore!'

		document.querySelector('#score > h2').textContent = 'You scored ' + syncData.highScore + '.'
	}
	else {
		document.querySelector('#score > h1').textContent = 'You scored ' + score + '.'

		document.querySelector('#score > h2').textContent = 'Your highscore is ' + syncData.highScore + '.'
	}

	await poky(2000)

	document.querySelector('#score').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	document.querySelector('#copyright').style.display = 'none'

	startGame()
}

const openSite = () => {
	shell.openExternal('https://ethanent.me')
}