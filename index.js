const {app, BrowserWindow} = require('electron')
const path = require('path')

app.on('ready', () => {
	const window = new BrowserWindow({
		'useContentSize': true,
		'resizable': false,
		'title': 'Munch v2'
	})

	window.setMenu(null)

	window.loadURL('file://' + path.join(__dirname, 'static', 'index.html'))

	window.webContents.on('devtools-opened', () => {
		window.webContents.closeDevTools()
	})

	window.on('close', () => {
		process.exit(0)
	})
})