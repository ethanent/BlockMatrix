const playSoundEffect = (effect) => {
	new Audio(path.join(__dirname, 'audio', effect)).play()
}