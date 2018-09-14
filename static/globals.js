const {shell} = require('electron')

const os = require('os')
const fs = require('fs')
const path = require('path')

const poky = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')))
const {version} = packageInfo
const apiBase = packageInfo.game.apiBase

const username = os.userInfo().username.toLowerCase()

const name = username.split(/ |\./).map((name) => name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase())

const syncData = {
	'highscore': 0,
	'returningPlayer': false
}