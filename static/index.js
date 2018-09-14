const os = require('os')

let name = os.userInfo().username.split(/ |\./).map((name) => name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase())

document.querySelector('h1').textContent = 'Welcome, ' + name[0] + '.'

setTimeout(() => {
	document.querySelector('#status').style.display = 'none'

	document.querySelector('#game').style.display = 'block'

	startGame()
}, 1000)

//startGame()

const gameEnded = () => {
	let {score} = gameState

	console.log('Game over! Score: ' + score)

	document.querySelector('h1').textContent = 'You scored ' + score + '.'

	document.querySelector('#status').style.display = 'block'

	document.querySelector('#game').style.display = 'none'

	setTimeout(() => {
		startGame()

		document.querySelector('#status').style.display = 'none'

		document.querySelector('#game').style.display = 'block'
	}, 1000)
}