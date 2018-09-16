const {app, BrowserWindow, Menu, MenuItem} = require('electron')
const path = require('path')

app.on('ready', () => {
	const window = new BrowserWindow({
		'resizable': false,
		'title': 'BlockMatrix',
		'width': 1205,
		'height': 903,
		'useContentSize': true
	})

	const mainMenu = Menu.buildFromTemplate([
		{
			'label': 'Game',
			'submenu': [
				{
					'label': 'View High Scores',
					'click': () => {
						let newHighScoresWindow = new BrowserWindow({
							'resizable': false,
							'title': 'BlockMatrix High Scores',
							'width': 600,
							'height': 900,
							'useContentSize': true
						})

						newHighScoresWindow.loadURL('file://' + path.join(__dirname, 'static', 'highscores.html'))
					}
				},
				{
					'role': 'close'
				},
				{
					'role': 'quit'
				}
			]
		}
	])

	Menu.setApplicationMenu(mainMenu)

	window.loadURL('file://' + path.join(__dirname, 'static', 'index.html'))

	window.on('close', () => {
		process.exit(0)
	})
})