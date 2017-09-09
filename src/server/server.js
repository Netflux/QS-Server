import Path from 'path'
import HTTP from 'http'
import Express from 'express'
import WebSocket from 'ws'
import Helmet from 'helmet'
import bodyParser from 'body-parser'
import ExpressValidator from 'express-validator'

import { setupAuth, hashPassword } from './auth'
import setupRoutes from './routes'
import db from './database/db'
import { TicketModel, TicketLogModel, UserModel } from './database/models'

// Verify the database connection
db.authenticate().then(() => {
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

	// Setup static content folder
	app.use(Express.static(Path.join(__dirname, '../../static')))

	// Enable Helmet middleware to set security-related HTTP headers
	app.use(Helmet())

	// Enable parsing of application/json and application/x-www-form-urlencoded
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	// Enable Express Validator for input validation/sanitization
	app.use(ExpressValidator({
		customValidators: {
			isString: value => typeof(value) === 'string'
		}
	}))

	// Load the authentication settings for the Express application
	setupAuth(app, db)

	// Load the routes for the Express application
	setupRoutes(app, wss)

	// Synchronize models to create database tables
	TicketModel.sync().then(() => TicketLogModel.sync())
		.then(() => UserModel.sync())
		.then(() => hashPassword('12345'))
		.then(hash => {
			return UserModel.findOrCreate({
				where: {
					username: 'root'
				},
				defaults: {
					username: 'root',
					password: hash
				}
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
		}).catch(err => {
			console.error(err)
		})
}).catch(err => {
	console.error(`Database Connection Error: ${err}`)
})
