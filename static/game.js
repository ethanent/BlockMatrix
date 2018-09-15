let heldKeys = []

document.addEventListener('keydown', (e) => {
	if (!heldKeys.includes(e.key)) heldKeys.push(e.key)
})

document.addEventListener('keyup', (e) => {
	if (heldKeys.includes(e.key)) heldKeys.splice(heldKeys.indexOf(e.key), 1)
})

const pointDist = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))

const renderer = new canvax.Renderer(document.querySelector('#game'))

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
		'vel': 0,
		'entities': [],
		'score': 0,
		'activePowerup': null,
		'odometer': 0,
		'allowMovement': false,
		'ended': false,
		'stats': {
			'powerupsUsed': 0
		},
		'started': performance.now()
	}
}

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

const addGoal = () => gameState.entities.push({
	'type': 'goal',
	'location': randomSafeLocation()
})

const addPowerUp = () => gameState.entities.push({
	'type': 'powerup',
	'location': randomSafeLocation(),
	'kind': ['slow', 'eliminator'][Math.floor(Math.random() * 2)]
})

const addEnemy = () => {
	let direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]

	gameState.entities.push({
		'type': 'dot',
		'direction': direction,
		'location': {
			'x': direction === 'up' || direction === 'down' ? Math.floor(Math.random() * renderer.element.width) : (direction === 'right' ? 20 : renderer.element.width - 20),
			'y': direction === 'left' || direction === 'right' ? Math.floor(Math.random() * renderer.element.height) : (direction === 'up' ? 20 : renderer.element.height - 20)
		},
		'multiplier': (Math.floor(Math.random() * 60) + 50) * 0.01
	})
}

const startGame = () => {
	gameState = defaultGameState()

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

	if (gameState.location.y <= 30 && gameState.accel.y < 0) gameState.accel.y = 0
	if (gameState.location.y >= renderer.element.height - 60 && gameState.accel.y > 0) gameState.accel.y = 0

	if (gameState.location.x <= 30 && gameState.accel.x < 0) gameState.accel.x = 0
	if (gameState.location.x >= renderer.element.width - 60 && gameState.accel.x > 0) gameState.accel.x = 0

	gameState.location.y += gameState.accel.y
	gameState.location.x += gameState.accel.x

	gameState.accel.y *= 0.92
	gameState.accel.x *= 0.92

	gameState.vel = Math.abs(gameState.accel.x) + Math.abs(gameState.accel.y)

	gameState.odometer += gameState.vel

	// Check for goal touching

	let goal = gameState.entities.find((ent) => ent.type === 'goal')

	if (goal && pointDist([gameState.location.x, gameState.location.y], [goal.location.x - 20, goal.location.y - 20]) < 65) {
		gameState.entities.splice(gameState.entities.findIndex((ent) => ent.type === 'goal'), 1)

		gameState.score++

		if (gameState.score > 10) document.body.style.backgroundColor = '#000000'

		if (gameState.activePowerup && gameState.score >= gameState.activePowerup.expires) gameState.activePowerup = null

		if (gameState.score % 5 === 0 && gameState.entities.findIndex((entity) => entity.type === 'powerup') === -1 && !gameState.activePowerup) {
			addPowerUp()
		}

		playSoundEffect('click.wav')

		addGoal()
		addEnemy()
	}

	// Update enemies, perform calculations

	gameState.entities.filter((entity) => entity.type === 'dot').forEach((dot) => {
		let moveAmount = dot.multiplier * gameState.vel

		if (gameState.activePowerup && gameState.activePowerup.kind === 'slow') {
			moveAmount *= 0.2
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

		if (pointDist([gameState.location.x, gameState.location.y], [dot.location.x - 30, dot.location.y - 30]) < 50) {
			if (gameState.ended) return

			gameState.ended = true

			gameState.allowMovement = false

			document.body.style.backgroundColor = '#F2F2F0'

			gameEnded()
		}
	})

	// Check for powerup activations

	gameState.entities.filter((entity) => entity.type === 'powerup').forEach((powerup) => {
		if (pointDist([gameState.location.x, gameState.location.y], [powerup.location.x - 30, powerup.location.y - 30]) < 50) {
			console.log('Activating powerup.')

			if (powerup.kind === 'slow') {
				gameState.activePowerup = {
					'kind': 'slow',
					'expires': gameState.score + 2
				}
			}

			if (powerup.kind === 'eliminator') {
				let eliminated = 0

				for (let i = 0; i < gameState.entities.length; i++) {
					if (eliminated > 4) break

					let entity = gameState.entities[i]

					if (entity.type === 'dot') {
						gameState.entities.splice(i, 1)

						eliminated++
					}
				}
			}

			gameState.stats.powerupsUsed++

			playSoundEffect('powerup.wav')

			gameState.entities.splice(gameState.entities.findIndex((entity) => entity.type === 'powerup'), 1)
		}
	})
}

const render = () => {
	// Clear all entities currently loaded

	renderer.clear()
	renderer.add(new canvax.Rectangle(gameState.location.x, gameState.location.y, gameState.size, gameState.size, '#FA9600', 'none'))

	// Render all entities

	gameState.entities.forEach((entity) => {
		if (entity.type === 'goal') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 30, '#A7DDA7', 'none'))
		}

		if (entity.type === 'dot') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 25, '#E74C3C', 'none'))
		}

		if (entity.type === 'powerup') {
			renderer.add(new canvax.Circle(entity.location.x, entity.location.y, 28, '#3498DB', 'none'))
		}
	})

	// Render score

	renderer.add(new canvax.Text(renderer.element.width - 30, 34, gameState.score, '28px Arial', (gameState.score > 10 ? '#F2F2F0' : '#000000'), 'end', 500))

	renderer.render()

	window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

setInterval(gameLoop, 10)