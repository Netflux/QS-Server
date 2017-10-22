import Passport from 'passport'
import WebSocket from 'ws'

import { TicketModel } from '../database/models'

const setupAPI = (app, wss) => {
	const MSG_TICKETS_CREATED = 'MSG_TICKETS_CREATED'
	const MSG_TICKETS_UPDATED = 'MSG_TICKETS_UPDATED'
	const broadcastTicketsUpdated = message => {
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message)
			}
		})
	}

	app.get('/api/login', (req, res) => {
		if (!req.user) {
			return res.sendStatus(403)
		}

		res.sendStatus(200)
	})

	app.post('/api/login', (req, res) => {
		req.checkBody('username', 'Invalid username').notEmpty().isString()
		req.checkBody('password', 'Invalid password').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeBody('username').escape()
			req.sanitizeBody('password').escape()

			Passport.authenticate('local', (err, user) => {
				if (err) {
					console.error(err)
					return res.sendStatus(500)
				}
				if (!user) { return res.sendStatus(403) }

				req.login(user, err => {
					if (err) {
						console.error(err)
						return res.sendStatus(500)
					}
					return res.sendStatus(200)
				})
			})(req, res)
		})
	})

	app.get('/api/logout', (req, res) => {
		req.logout()
		res.sendStatus(200)
	})

	app.get('/api/tickets', (req, res) => {
		if (req.query.timestamp) {
			req.checkQuery('timestamp', 'Invalid timestamp').isInt()
		}

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeQuery('timestamp').toInt()

			const timestamp = req.query.timestamp || 0

			TicketModel.findAll({
				attributes: req.user ? [ ...TicketModel.attrs, 'secret' ] : TicketModel.attrs,
				where: {
					$or: [
						{ createdAt: { $gt: timestamp } },
						{ updatedAt: { $gt: timestamp } }
					]
				},
				order: [ [ 'id', 'ASC' ] ]
			}).then(tickets => {
				return res.json({ data: tickets })
			}).catch(err => {
				console.error(err)
				res.sendStatus(500)
			})
		})
	})

	app.post('/api/tickets', (req, res) => {
		req.checkBody('key', 'Invalid key').notEmpty().isString()
		req.checkBody('secret', 'Invalid secret').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeBody('key').escape()
			req.sanitizeBody('secret').escape()

			TicketModel.findOrCreate({
				attributes: [ ...TicketModel.attrs, 'secret' ],
				where: {
					key: req.body.key,
					secret: req.body.secret,
					status: { $in: [ TicketModel.status.PENDING, TicketModel.status.SERVING ] }
				},
				order: [ [ 'id', 'ASC' ] ],
				defaults: {
					key: req.body.key,
					secret: req.body.secret,
					time_created: Date.now(),
					status: TicketModel.status.PENDING
				}
			}).spread((ticket, created) => {
				if (created) { res.status(201) }

				// Return the ticket data in the response
				res.json({ data: ticket.dataValues })

				// Broadcast on WebSocket that ticket(s) have been updated
				return broadcastTicketsUpdated(MSG_TICKETS_CREATED)
			}).catch(err => {
				console.error(err)
				res.sendStatus(500)
			})
		})
	})

	app.delete('/api/tickets/:id', (req, res) => {
		req.checkParams('id', 'Invalid ID').isInt()
		req.checkBody('key', 'Invalid key').notEmpty().isString()
		req.checkBody('secret', 'Invalid secret').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeParams('id').toInt()
			req.sanitizeBody('key').escape()
			req.sanitizeBody('secret').escape()

			// Update the ticket as cancelled
			TicketModel.update({ status: TicketModel.status.CANCELLED }, {
				where: {
					id: req.params.id,
					key: req.body.key,
					secret: req.body.secret
				}
			}).then(result => {
				if (result[0] !== 1) {
					return res.sendStatus(422)
				}

				// Return a 'No Content' response header indicating success
				res.sendStatus(204)

				// Broadcast on WebSocket that ticket(s) have been updated
				return broadcastTicketsUpdated(MSG_TICKETS_UPDATED)
			}).catch(err => {
				console.error(err)
				res.sendStatus(500)
			})
		})
	})

	app.get('/api/tickets/current', (req, res) => {
		TicketModel.findOne({
			attributes: TicketModel.attrs,
			where: { status: TicketModel.status.SERVING },
			order: [ [ 'id', 'ASC' ] ]
		}).then(ticket => {
			return res.json({ data: ticket })
		}).catch(err => {
			console.error(err)
			res.sendStatus(500)
		})
	})

	app.get('/api/tickets/next', (req, res) => {
		if (!req.user) {
			return res.sendStatus(403)
		}

		// Update the ticket as served
		TicketModel.update({ status: TicketModel.status.SERVED }, {
			where: { status: TicketModel.status.SERVING }
		}).then(result => {
			if (result[0] !== 1) {
				return res.sendStatus(422)
			}

			// Return a 'No Content' response header indicating success
			res.sendStatus(204)

			// Broadcast on WebSocket that ticket(s) have been updated
			return broadcastTicketsUpdated(MSG_TICKETS_UPDATED)
		}).catch(err => {
			console.error(err)
			res.sendStatus(500)
		})
	})

	app.get('/api/*', (req, res) => {
		res.sendStatus(404)
	})
}

export default setupAPI
