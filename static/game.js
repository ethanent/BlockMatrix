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
	const gen = {
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
			'dotsEaten': 0,
			'ggPowerupsUsed': 0
		},
		'lastGoalReach': 0,
		'started': performance.now(),
		'highscorePosition': -1,
		'backgroundColor': '#F2F2F0',
		'currentBackgroundColor': '#F2F2F0',
		'moveRate': 1,
		'renderedFrames': 0,
		'player': new canvax.Rectangle(40, 40, 60, 60, '#FFBB59', 'none')
	}

	return gen
}

let gameState = defaultGameState()

const randomCoordsInRange = () => [Math.floor(Math.random() * (renderer.element.width - 200)) + 100, Math.floor(Math.random() * (renderer.element.height - 200)) + 100]

const randomSafeLocation = () => {
	let coords = randomCoordsInRange()

	while (pointDist(coords, [gameState.player.x, gameState.player.y]) < 300) {
		coords = randomCoordsInRange()
	}

	console.log('Random safe coords: ' + coords)

	return {
		'x': coords[0],
		'y': coords[1]
	}
}

const addGoal = () => {
	const loc = randomSafeLocation()
	
	gameState.entities.splice(0, 0, {
		'type': 'goal',
		'entity': new canvax.Circle(loc.x, loc.y, 30, '#A7DDA7', 'none')
	})
}

const addPowerUp = () => {
	let possiblePowerups = ['slow', 'destroy', 'speed', 'grow']

	const ggRand = Math.floor(Math.random() * 100)

	if (gameState.entities.filter((entity) => entity.type === 'dot').length > 10) {
		console.log('ggRand: ' + ggRand)

		if (ggRand === 1) {
			console.log('Creating GG powerup')

			possiblePowerups = ['GG']
		}
	}

	const loc = randomSafeLocation()

	gameState.entities.push({
		'type': 'powerup',
		'kind': possiblePowerups[Math.floor(Math.random() * possiblePowerups.length)],
		'entity': new canvax.Circle(loc.x, loc.y, 25, '#3498DB', 'none')
	})
}

const addEnemy = () => {
	let enemyData

	while (!enemyData || pointDist([gameState.player.x, gameState.player.y], [enemyData.entity.x, enemyData.entity.y]) < 300) {
		let direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]

		const xPos = direction === 'up' || direction === 'down' ? Math.floor(Math.random() * renderer.element.width) : (direction === 'right' ? 20 : renderer.element.width - 20)
		const yPos = direction === 'left' || direction === 'right' ? Math.floor(Math.random() * renderer.element.height) : (direction === 'up' ? 20 : renderer.element.height - 20)

		enemyData = {
			'type': 'dot',
			'direction': direction,
			'multiplier': (Math.floor(Math.random() * 60) + 50) * 0.01,
			'entity': new canvax.Circle(xPos, yPos, 25, '#E74C3C', 'none')
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
			if (dot.entity.y > gameState.player.y) {
				dot.direction = 'up'
			}
			else {
				dot.direction = 'down'
			}
		}
		else if (dot.direction === 'left' || dot.direction === 'right') {
			if (dot.entity.x > gameState.player.x) {
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

	/*try {
		const highScores = await api.getHighScores()

		gameState.highscorePosition = highScores.findIndex((score) => score.username === username)
	}
	catch (err) {
		console.error(err)
		console.log('Failed to fetch high scores.')
	}*/

	gameState.allowMovement = true

	addGoal()
	addEnemy()
}

const gameLoop = () => {
	if (gameState.allowMovement) {
		if (heldKeys.includes('ArrowUp') || heldKeys.includes('w')) gameState.accel.y -= 1 * gameState.moveRate
		if (heldKeys.includes('ArrowDown') || heldKeys.includes('s')) gameState.accel.y += 1 * gameState.moveRate
		if (heldKeys.includes('ArrowLeft') || heldKeys.includes('a')) gameState.accel.x -= 1 * gameState.moveRate
		if (heldKeys.includes('ArrowRight') || heldKeys.includes('d')) gameState.accel.x += 1 * gameState.moveRate
	}

	if (gameState.player.y <= 0 && gameState.accel.y < 0) gameState.accel.y = 0
	if (gameState.player.y >= renderer.element.height - gameState.player.height && gameState.accel.y > 0) gameState.accel.y = 0

	if (gameState.player.x <= 0 && gameState.accel.x < 0) gameState.accel.x = 0
	if (gameState.player.x >= renderer.element.width - gameState.player.width && gameState.accel.x > 0) gameState.accel.x = 0

	gameState.player.y += gameState.accel.y * gameState.moveRate
	gameState.player.x += gameState.accel.x * gameState.moveRate

	gameState.accel.y *= 1 - ((1 - (0.92 + gameState.globalAccelEffect)) * gameState.moveRate)
	gameState.accel.x *= 1 - ((1 - (0.92 + gameState.globalAccelEffect)) * gameState.moveRate)

	gameState.vel = Math.abs(gameState.accel.x) + Math.abs(gameState.accel.y)

	gameState.odometer += gameState.vel * gameState.moveRate

	// Check for powerup expiry

	if (gameState.activePowerup && typeof gameState.activePowerup.expires === 'number') {
		if (gameState.odometer > gameState.activePowerup.expires) gameState.activePowerup = null
	}

	// Handle GG powerup

	if (gameState.activePowerup && gameState.activePowerup.kind === 'gg') {
		gameState.activePowerup.radius += 5

		if (gameState.activePowerup.radius > 1300) {
			gameState.activePowerup = null
		}
	}

	// Handle growth

	if (gameState.activePowerup && gameState.activePowerup.kind === 'grow') {
		gameState.player.width = 120
		gameState.player.height = 120
	}
	else {
		gameState.player.width = 60
		gameState.player.height = 60
	}

	// Check for goal touching

	let goal = gameState.entities.find((ent) => ent.type === 'goal')

	if (!gameState.ended && goal && gameState.player.intersects(goal.entity)) {
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

		if (gameState.score % 5 === 0 && gameState.entities.findIndex((entity) => entity.type === 'powerup') === -1) {
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
		let moveAmount = dot.multiplier * gameState.vel * gameState.moveRate

		if (gameState.activePowerup) {
			if (gameState.activePowerup.kind === 'speed') {
				moveAmount *= 1.2
			}
			else if (gameState.activePowerup.kind === 'slow') {
				moveAmount *= 0.1
			}
		}

		if (dot.direction === 'up') {
			dot.entity.y += moveAmount

			if (dot.entity.y > renderer.element.height) dot.direction = 'down'
		}
		else if (dot.direction === 'down') {
			dot.entity.y -= moveAmount

			if (dot.entity.y < 0) dot.direction = 'up'
		}
		else if (dot.direction === 'left') {
			dot.entity.x -= moveAmount

			if (dot.entity.x < 0) dot.direction = 'right'
		}
		else if (dot.direction === 'right') {
			dot.entity.x += moveAmount

			if (dot.entity.x > renderer.element.width) dot.direction = 'left'
		}

		if (gameState.player.intersects(dot.entity)) {
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

		// Destroy if GG powerup and should be gone.

		if (gameState.activePowerup && gameState.activePowerup.kind === 'gg') {
			if (pointDist([renderer.element.width / 2, renderer.element.height / 2], [dot.entity.x, dot.entity.y]) < gameState.activePowerup.radius) {
				playSoundEffect('destroy.wav')

				gameState.entities.splice(dot.index, 1)

				gameState.stats.dotsEaten++
			}
		}
	})

	// Check for powerup activations

	if (!gameState.ended) gameState.entities.filter((entity) => entity.type === 'powerup').forEach((powerup) => {
		if (gameState.player.intersects(powerup.entity)) {
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

			if (powerup.kind === 'speed') {
				gameState.activePowerup = {
					'kind': 'speed',
					'expires': gameState.odometer + 2600,
					'startedAt': gameState.odometer
				}
			}

			if (powerup.kind === 'grow') {
				gameState.activePowerup = {
					'kind': 'grow',
					'expires': gameState.odometer + 2600,
					'startedAt': gameState.odometer
				}

				gameState.entities.filter((entity) => entity.type === 'dot').forEach((enemy) => {
					if (pointDist([enemy.entity.x, enemy.entity.y], [gameState.player.x, gameState.player.y]) < 400) {
						playSoundEffect('destroy.wav')

						gameState.entities.splice(gameState.entities.indexOf(enemy), 1)
					}
				})
			}

			if (powerup.kind === 'GG') {
				gameState.stats.ggPowerupsUsed++

				gameState.activePowerup = {
					'kind': 'gg',
					'radius': 0
				}
			}

			gameState.stats.powerupsUsed++

			playSoundEffect('powerup.wav')

			gameState.entities.splice(gameState.entities.findIndex((entity) => entity.type === 'powerup'), 1)
		}
	})

	// Update background color

	if (!gameState.ended) {
		if (gameState.activePowerup && gameState.activePowerup.kind === 'gg') {
			gameState.backgroundColor = '#515261'
		}
		else if (gameState.moveRate < 1) {
			gameState.backgroundColor = '#111314'
		}
		else if (gameState.score > 10) {
			gameState.backgroundColor = '#000000'
		}
		else {
			gameState.backgroundColor = '#F2F2F0'
		}
	}
}

const render = () => {
	gameState.renderedFrames++

	// Set background color.

	if (gameState.currentBackgroundColor !== gameState.backgroundColor) {
		console.log('Updating game background color.')

		document.body.style.backgroundColor = gameState.backgroundColor
		gameState.currentBackgroundColor = gameState.backgroundColor
	}

	// Clear all entities currently loaded
	
	renderer.clear()

	let renderBlockColor

	if (gameState.activePowerup && gameState.activePowerup.kind === 'destroy') {
		if (gameState.activePowerup.expires < gameState.odometer + 400) {
			renderBlockColor = '#16415E'
		}
		else renderBlockColor = '#3498DB'
	}
	else if (gameState.activePowerup && gameState.activePowerup.kind === 'speed') {
		if (gameState.activePowerup.expires < gameState.odometer + 400) {
			renderBlockColor = '#836890'
		}
		else renderBlockColor = '#A986BA'
	}
	else if (gameState.highscorePosition === 0) {
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

	gameState.player.backgroundColor = renderBlockColor

	renderer.add(gameState.player)

	// Render all entities

	gameState.entities.forEach((entity) => {
		if (entity.type === 'powerup') {
			renderer.add(new canvax.Text(entity.entity.x, entity.entity.y - 30, entity.kind.toUpperCase(), '20px Roboto', (gameState.score > 10 ? '#F2F2F0' : '#000000'), 'center', 500))
		}

		renderer.add(entity.entity)
	})

	// Render GG powerup circle if needed

	if (gameState.activePowerup && gameState.activePowerup.kind === 'gg') {
		renderer.add(new canvax.Circle(renderer.element.width / 2, renderer.element.height / 2, gameState.activePowerup.radius, 'none', '#ED553B', 5))
	}

	// Render score

	renderer.add(new canvax.Text(renderer.element.width - 30, 34, gameState.score, '28px Roboto', (gameState.score > 10 || gameState.moveRate < 1 ? '#F2F2F0' : '#000000'), 'end', 500))

	// Render powerup progress bar if needed

	if (gameState.activePowerup && typeof gameState.activePowerup.expires === 'number') renderer.add(new canvax.Rectangle(0, renderer.element.height - 15, ((gameState.odometer - gameState.activePowerup.startedAt) / (gameState.activePowerup.expires - gameState.activePowerup.startedAt)) * renderer.element.width, 15, '#00A388', 'none'))

	renderer.render()

	window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

setInterval(gameLoop, 10)