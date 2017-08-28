import HTTP from 'http'
import Express from 'express'
import bodyParser from 'body-parser'
import ExpressValidator from 'express-validator'
import WebSocket from 'ws'

import loadRoutes from './routes'
import db from './database/db'
import { TicketModel, TicketLogModel, UserModel } from './database/models'

// Create a new instance of the Express application
const app = Express()
const port = process.env.PORT || 3000

// Create a HTTP and WebSocket Server
const server = HTTP.createServer(app)
const wss = new WebSocket.Server({ server })

// Setup WebSocket conenctions to timeout after 1 minute if not responding
wss.on('connection', ws => {
	ws.isAlive = true
	ws.on('pong', () => {
		ws.isAlive = true
	})
})
setInterval(() => {
	wss.clients.forEach(ws => {
		if (ws.isAlive === false) {
			return ws.terminate()
		}

		ws.isAlive = false
		ws.ping('', false, true)
	})
}, 60000)

// Enable parsing of application/json and application/x-www-form-urlencoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Enable Express Validator for input validation/sanitization
app.use(ExpressValidator({
	customValidators: {
		isString: value => typeof(value) === 'string'
	}
}))

// Load the routes for the Express application
loadRoutes(app, wss)

// Verify the database connection
db.authenticate().then(() => {
	// Synchronize models to create database tables
	TicketModel.sync()
	TicketLogModel.sync()
	UserModel.sync().then(() => {
		return UserModel.upsert({
			username: 'root',
			password: '12345'
		})
	}).then(() => {
		// Finally, start the Express application
		server.listen(port, err => {
			if (err) {
				console.error(err)
			} else {
				console.log(`QS-Server listening on port ${port}.`)
			}
		})
	})
})
.catch(err => {
	console.error(`Database Connection Error: ${err}`)
})
