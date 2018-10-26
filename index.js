const {app, BrowserWindow, Menu, MenuItem} = require('electron')
const path = require('path')

app.on('ready', () => {
	const window = new BrowserWindow({
		'resizable': false,
		'title': 'BlockMatrix',
		'width': 1215,
		'height': 920,
		'useContentSize': true
	})

	const mainMenu = Menu.buildFromTemplate([
		{
			'label': 'File',
			'submenu': [
				{
					'role': 'close'
				},
				{
					'role': 'quit'
				}
			]
		},
		{
			'label': 'Game',
			'submenu': [
				{
					'label': 'View High Scores',
					'click': () => {
						let newHighScoresWindow = new BrowserWindow({
							'title': 'BlockMatrix High Scores',
							'width': 600,
							'height': 900,
							'useContentSize': true
						})

						newHighScoresWindow.loadURL('file://' + path.join(__dirname, 'static', 'highscores.html'))
					}
				},
				{
					'label': 'View Game Stats',
					'click': () => {
						let newStatsWindow = new BrowserWindow({
							'title': 'BlockMatrix Statistics',
							'width': 900,
							'height': 1000,
							'useContentSize': true
						})

						newStatsWindow.loadURL('file://' + path.join(__dirname, 'static', 'stats.html'))
					}
				},
				{
					'label': 'Game Audio',
					'type': 'checkbox',
					'checked': true,
					'click': () => {
						window.webContents.setAudioMuted(!window.webContents.isAudioMuted())
						this.checked = window.webContents.isAudioMuted()
					}
				}
			]
		},
		{
			'label': 'Help',
			'submenu': [
				{
					'label': 'How to Play',
					'click': () => {
						new BrowserWindow({
							'title': 'How to play BlockMatrix',
							'width': 900,
							'height': 1000,
							'useContentSize': true
						}).loadURL('file://' + path.join(__dirname, 'static', 'learn.html'))
					}
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