let heldKeys = []

document.addEventListener('keydown', (e) => {
	if (!heldKeys.includes(e.key)) heldKeys.push(e.key)
})

document.addEventListener('keyup', (e) => {
	if (heldKeys.includes(e.key)) heldKeys.splice(heldKeys.indexOf(e.key), 1)
})

const renderer = new canvax.Renderer(document.querySelector('#game'))

renderer.ctx.transform(1, 0, 0, -1, 0, renderer.element.height)

let gameState = {
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
	'entities': []
}

const addGoal = () => gameState.entities.push({
	'type': 'goal',
	'location': {
		'x': Math.floor(Math.random() * (renderer.element.width - 200)) + 100,
		'y': Math.floor(Math.random() * (renderer.element.height - 200)) + 100
	}
})

const addEnemy = () => {
	let direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)]

	gameState.entities.push({
		'type': 'dot',
		'direction': direction,
		'location': {
			'x': direction === 'up' || direction === 'down' ? Math.floor(Math.random() * renderer.element.width) : (direction === 'right' ? 20 : renderer.element.width - 20),
			'y': direction === 'left' || direction === 'right' ? Math.floor(Math.random() * renderer.element.width) : (direction === 'up' ? 20 : renderer.element.height - 20)
		},
		'multiplier': (Math.floor(Math.random() * 40) + 50) * 0.01
	})
}

addGoal()
addEnemy()

const gameLoop = () => {
	if (heldKeys.includes('ArrowUp')) gameState.accel.y += 1
	if (heldKeys.includes('ArrowDown')) gameState.accel.y -= 1
	if (heldKeys.includes('ArrowLeft')) gameState.accel.x -= 1
	if (heldKeys.includes('ArrowRight')) gameState.accel.x += 1

	if (gameState.location.y <= 30 && gameState.accel.y < 0) gameState.accel.y = 0
	if (gameState.location.y >= renderer.element.height - 30 && gameState.accel.y > 0) gameState.accel.y = 0

	if (gameState.location.x <= 30 && gameState.accel.x < 0) gameState.accel.x = 0
	if (gameState.location.x >= renderer.element.width - 30 && gameState.accel.x > 0) gameState.accel.x = 0

	gameState.location.y += gameState.accel.y
	gameState.location.x += gameState.accel.x

	gameState.accel.y *= 0.88
	gameState.accel.x *= 0.88

	gameState.vel = Math.abs(gameState.accel.x) + Math.abs(gameState.accel.y)

	// Check for goal touching

	let goal = gameState.entities.find((ent) => ent.type === 'goal')

	if (goal && Math.sqrt(Math.pow(gameState.location.x - (goal.location.x - 20), 2) + Math.pow(gameState.location.y - (goal.location.y - 20), 2)) < 60) {
		console.log('touch')

		gameState.entities.splice(gameState.entities.findIndex((ent) => ent.type === 'goal'), 1)

		addGoal()
		addEnemy()
	}

	// Update enemies, perform calculations

	gameState.entities.filter((entity) => entity.type === 'dot').forEach((dot) => {
		const moveAmount = dot.multiplier * gameState.vel

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
	})

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
	})

	renderer.render()
}

setInterval(gameLoop, 10)