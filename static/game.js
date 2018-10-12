let heldKeys = []

document.addEventListener('keydown', (e) => {
	if (!heldKeys.includes(e.key)) heldKeys.push(e.key)
})

document.addEventListener('keyup', (e) => {
	if (heldKeys.includes(e.key)) heldKeys.splice(heldKeys.indexOf(e.key), 1)
})

const pointDist = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))

const renderer = new canvax.Renderer(document.querySelector('#game'))

renderer.element.width = window.innerWidth
renderer.element.height = window.innerHeight

//renderer.ctx.transform(1, 0, 0, -1, 0, renderer.element.height)

const defaultGameState = () => {
	return {
		'location': {
			'x': 100,
			'y': 100
		},
		'size': 60,
		'accel': {
			'x': 0,
			'y': 0
		},
		'globalAccelEffect': 0,
		'vel': 0,
		'entities': [],
		'score': 0,
		'activePowerup': null,
		'odometer': 0,
		'allowMovement': false,
		'ended': false,
		'stats': {
			'powerupsUsed': 0,
			'dotsEaten': 0
		},
		'lastGoalReach': 0,
		'started': performance.now(),
		'highscorePosition': -1,
		'backgroundColor': '#F2F2F0',
		'currentBackgroundColor': '#F2F2F0'
	}
}

const borderMovementGap = 40

let gameState = defaultGameState()

const randomCoordsInRange = () => [Math.floor(Math.random() * (renderer.element.width - 200)) + 100, Math.floor(Math.random() * (renderer.element.height - 200)) + 100]

const randomSafeLocation = () => {
	let coords = randomCoordsInRange()

	while (pointDist(coords, [gameState.location.x, gameState.location.y]) < 300) {
		coords = randomCoordsInRange()
	}

	console.log('Random safe coords: ' + coords)

	return {
		'x': coords[0],
		'y': coords[1]
	}
}

const addGoal = () => gameState.entities.splice(0, 0, {
	'type': 'goal',
	'location': randomSafeLocation()
})

const addPowerUp = () => gameState.entities.push({
	'type': 'powerup',
	'location': randomSafeLocation(),
	'kind': ['slow', 'destroy'][Math.floor(Math.random() * 2)]
})

const addEnemy = () => {
	let enemyData

	while (!enemyData || pointDist([gameState.location.x, gameState.location.y], [enemyData.location.x, enemyData.location.y]) < 300) {
		let direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]

		enemyData = {
			'type': 'dot',
			'direction': direction,
			'location': {
				'x': direction === 'up' || direction === 'down' ? Math.floor(Math.random() * renderer.element.width) : (direction === 'right' ? 20 : renderer.element.width - 20),
				'y': direction === 'left' || direction === 'right' ? Math.floor(Math.random() * renderer.element.height) : (direction === 'up' ? 20 : renderer.element.height - 20)
			},
			'multiplier': (Math.floor(Math.random() * 60) + 50) * 0.01
		}
	}

	gameState.entities.push(enemyData)
}

const turnEnemiesAway = () => {
	gameState.entities.filter((entity) => entity.type === 'dot').forEach((dot) => {
		if (dot.direction === 'up') {
			dot.direction = 'right'
		}
		else if (dot.direction === 'right') {
			dot.direction = 'down'
		}
		else if (dot.direction === 'down') {
			dot.direction = 'left'
		}
		else if (dot.direction === 'left') {
			dot.direction = 'up'
		}

		if (dot.direction === 'up' || dot.direction === 'down') {
			if (dot.location.y > gameState.location.y) {
				dot.direction = 'up'
			}
			else {
				dot.direction = 'down'
			}
		}
		else if (dot.direction === 'left' || dot.direction === 'right') {
			if (dot.location.x > gameState.location.x) {
				dot.direction = 'right'
			}
			else {
				dot.direction = 'left'
			}
		}
	})
}

const startGame = async () => {
	gameState = defaultGameState()

	try {
		const highScores = await api.getHighScores()

		gameState.highscorePosition = highScores.findIndex((score) => score.username === username)
	}
	catch (err) {
		console.error(err)
		console.log('Failed to fetch high scores.')
	}

	gameState.allowMovement = true

	addGoal()
	addEnemy()
}

const gameLoop = () => {
	if (gameState.allowMovement) {
		if (heldKeys.includes('ArrowUp')) gameState.accel.y -= 1
		if (heldKeys.includes('ArrowDown')) gameState.accel.y += 1
		if (heldKeys.includes('ArrowLeft')) gameState.accel.x -= 1
		if (heldKeys.includes('ArrowRight')) gameState.accel.x += 1
	}

	if (gameState.location.y <= borderMovementGap && gameState.accel.y < 0) gameState.accel.y = 0
	if (gameState.location.y >= renderer.element.height - borderMovementGap && gameState.accel.y > 0) gameState.accel.y = 0

	if (gameState.location.x <= borderMovementGap && gameState.accel.x < 0) gameState.accel.x = 0
	if (gameState.location.x >= renderer.element.width - borderMovementGap && gameState.accel.x > 0) gameState.accel.x = 0

	gameState.location.y += gameState.accel.y
	gameState.location.x += gameState.accel.x

	gameState.accel.y *= 0.92 + gameState.globalAccelEffect
	gameState.accel.x *= 0.92 + gameState.globalAccelEffect

	gameState.vel = Math.abs(gameState.accel.x) + Math.abs(gameState.accel.y)

	gameState.odometer += gameState.vel

	// Check for powerup expiry

	if (gameState.activePowerup) {
		if (gameState.odometer > gameState.activePowerup.expires) gameState.activePowerup = null
	}

	// Check for goal touching

	let goal = gameState.entities.find((ent) => ent.type === 'goal')

	if (!gameState.ended && goal && pointDist([gameState.location.x, gameState.location.y], [goal.location.x, goal.location.y]) < 62) {
		gameState.entities.splice(gameState.entities.findIndex((ent) => ent.type === 'goal'), 1)

		gameState.score++
		gameState.lastGoalReach = gameState.odometer

		if (gameState.score >= 42 && gameState.score % 7 === 0) {
			turnEnemiesAway()

			console.log('Turned enemies away.')
		}

		if (gameState.score % 37 === 0 && gameState.globalAccelEffect < 0.006) {
			gameState.globalAccelEffect += 0.002

			console.log('Updated globalAccelEffect to ' + gameState.globalAccelEffect)
		}

		if (gameState.score % 5 === 0 && gameState.entities.findIndex((entity) => entity.type === 'powerup') === -1 && !gameState.activePowerup) {
			addPowerUp()
		}

		playSoundEffect('click.wav')

		addGoal()
		addEnemy()
	}

	// Update enemies, perform calculations

	gameState.entities.map((entity, i) => {
		return Object.assign(entity, {
			'index': i
		})
	}).filter((entity) => entity.type === 'dot').forEach((dot) => {
		let moveAmount = dot.multiplier * gameState.vel

		if (gameState.activePowerup && gameState.activePowerup.kind === 'slow') {
			moveAmount *= 0.1
		}

		if (dot.direction === 'up') {
			dot.location.y += moveAmount

			if (dot.location.y > renderer.element.height) dot.direction = 'down'
		}
		else if (dot.direction === 'down') {
			dot.location.y -= moveAmount

			if (dot.location.y < 0) dot.direction = 'up'
		}
		else if (dot.direction === 'left') {
			dot.location.x -= moveAmount

			if (dot.location.x < 0) dot.direction = 'right'
		}
		else if (dot.direction === 'right') {
			dot.location.x += moveAmount

			if (dot.location.x > renderer.element.width) dot.direction = 'left'
		}

		if (pointDist([gameState.location.x, gameState.location.y], [dot.location.x, dot.location.y]) < 56) {
			if (gameState.activePowerup && gameState.activePowerup.kind === 'destroy') {
				playSoundEffect('destroy.wav')

				gameState.entities.splice(dot.index, 1)

				gameState.stats.dotsEaten++
			}
			else {
				if (gameState.ended) return

				gameState.ended = true

				gameState.allowMovement = false

				document.body.style.backgroundColor = '#C33325'

				gameEnded()
			}
		}
	})

	// Check for powerup activations

	if (!gameState.ended) gameState.entities.filter((entity) => entity.type === 'powerup').forEach((powerup) => {
		if (pointDist([gameState.location.x, gameState.location.y], [powerup.location.x, powerup.location.y]) < 55) {
			console.log('Activating powerup.')

			if (powerup.kind === 'slow') {
				gameState.activePowerup = {
					'kind': 'slow',
					'expires': gameState.odometer + 2600,
					'startedAt': gameState.odometer
				}
			}

			if (powerup.kind === 'destroy') {
				gameState.activePowerup = {
					'kind': 'destroy',
					'expires': gameState.odometer + 1500,
					'startedAt': gameState.odometer
				}
			}

			gameState.stats.powerupsUsed++

			playSoundEffect('powerup.wav')

			gameState.entities.splice(gameState.entities.findIndex((entity) => entity.type === 'powerup'), 1)
		}
	})

	// Update background color

	if (!gameState.ended) {
		if (gameState.score > 10) {
			gameState.backgroundColor = '#000000'
		}
		else {
			gameState.backgroundColor = '#F2F2F0'
		}
	}
}

const render = () => {
	// Set background color.

	if (gameState.currentBackgroundColor !== gameState.backgroundColor) {
		console.log('Updating game background color.')

		document.body.style.backgroundColor = gameState.backgroundColor
		gameState.currentBackgroundColor = gameState.backgroundColor
	}

	// Clear all entities currently loaded

	renderer.clear()

	let renderBlockColor = (gameState.activePowerup && gameState.activePowerup.kind === 'destroy' ? '#3498DB' : false)

	if (renderBlockColor === false) {
		if (gameState.highscorePosition === 0) {
			renderBlockColor = '#FFCA09'
		}
		else if (gameState.highscorePosition === 1) {
			renderBlockColor = '#B6B5B8'
		}
		else if (gameState.highscorePosition === 2) {
			renderBlockColor = '#9C893A'
		}
		else {
			renderBlockColor = '#FFBB59'
		}
	}

	renderer.add(new canvax.Rectangle(gameState.location.x - gameState.size / 2, gameState.location.y - gameState.size / 2, gameState.size, gameState.size, renderBlockColor, 'none'))

	// Render all entities

	gameState.entities.forEach((entity) => {
		if (entity.type === 'goal') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 30, '#A7DDA7', 'none'))
		}

		if (entity.type === 'dot') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 25, '#E74C3C', 'none'))
		}

		if (entity.type === 'powerup') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 25, '#3498DB', 'none'))

			renderer.add(new canvax.Text(entity.location.x, entity.location.y - 30, entity.kind.toUpperCase(), '20px Roboto', (gameState.score > 10 ? '#F2F2F0' : '#000000'), 'center', 500))
		}
	})

	// Render score

	renderer.add(new canvax.Text(renderer.element.width - 30, 34, gameState.score, '28px Roboto', (gameState.score > 10 ? '#F2F2F0' : '#000000'), 'end', 500))

	// Render powerup progress bar if needed

	if (gameState.activePowerup) renderer.add(new canvax.Rectangle(0, renderer.element.height - 15, ((gameState.odometer - gameState.activePowerup.startedAt) / (gameState.activePowerup.expires - gameState.activePowerup.startedAt)) * renderer.element.width, 15, '#00A388', 'none'))

	renderer.render()

	window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

setInterval(gameLoop, 10)