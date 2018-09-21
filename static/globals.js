const {shell} = require('electron')

const os = require('os')
const fs = require('fs')
const path = require('path')

const poky = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
var sy=function sy(tag,attribs,children){if(!tag)throw new Error("Missing tag argument.");var gen=document.createElement(tag);if(attribs)Object.keys(attribs).forEach(function(attrib){return gen.setAttribute(attrib,attribs[attrib])});if(children)children.forEach(function(child){return child!==null?gen.appendChild(typeof child==="string"?document.createTextNode(child):child):null});return gen};

const parseUsername = (inputUsername) => inputUsername.split(/ |\./).map((name) => name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase())

const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')))
const {version} = packageInfo
const apiBase = packageInfo.game.apiBase

const username = os.userInfo().username.toLowerCase()

const name = parseUsername(username)

let syncData = {
	'highscore': 0,
	'returningPlayer': false,
	'gamesPlayed': 0
}

const openSite = () => {
	shell.openExternal('https://ethanent.me')
}