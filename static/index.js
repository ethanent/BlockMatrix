const {shell} = require('electron')

const os = require('os')
const fs = require('fs')
const path = require('path')

const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'))).version

let name = os.userInfo().username.split(/ |\./).map((name) => name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase())

let syncData = {
	'highScore': 0
}

document.querySelector('h1').textContent = 'Welcome, ' + name[0] + '.'

setTimeout(() => {
	document.querySelector('#status').style.display = 'none'
	document.querySelector('#copyright').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	startGame()
}, 1000)

//startGame()

const gameEnded = () => {
	playSoundEffect('death.mp3')

	let {score} = gameState

	setTimeout(() => {
		console.log('Game over! Score: ' + score)

		document.querySelector('#copyright').style.display = 'block'

		document.querySelector('#status > h1').textContent = 'Hold on.'

		document.querySelector('#status').style.display = 'block'

		document.querySelector('#game').style.display = 'none'

		setTimeout(() => {
			document.querySelector('#status').style.display = 'none'

			document.querySelector('#score').style.display = 'block'

			if (score > syncData.highScore) syncData.highScore = score

			document.querySelector('#score > h1').textContent = 'You scored ' + score + '.'

			document.querySelector('#score > h2').textContent = 'Your highscore is ' + syncData.highScore + '.'

			setTimeout(() => {
				document.querySelector('#score').style.display = 'none'

				document.querySelector('#game').style.display = 'block'

				document.querySelector('#copyright').style.display = 'none'

				startGame()
			}, 3000)
		}, 700)
	}, 600)
}

const openSite = () => {
	shell.openExternal('https://ethanent.me')
}