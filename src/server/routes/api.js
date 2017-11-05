import Passport from 'passport'
import WebSocket from 'ws'

import { TicketModel, KeyPairModel } from 'server/database/models'
import { WS_MSG, SYSTEM_STATUS, KEYS } from 'shared/constants'

const setupAPI = (app, wss) => {
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

	app.get('/api/system', (req, res) => {
		KeyPairModel.getItem(KEYS.SYSTEM_STATUS).then(value => {
			if (value === SYSTEM_STATUS.DISABLED) {
				return res.sendStatus(503)
			}

			res.sendStatus(200)
		}).catch(err => {
			console.error(err)
			res.sendStatus(500)
		})
	})

	app.post('/api/system', (req, res) => {
		if (!req.user) {
			return res.sendStatus(403)
		}

		req.checkBody('status', 'Invalid status').isInt()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeBody('status').toInt()

			KeyPairModel.setItem(KEYS.SYSTEM_STATUS, req.body.status).then(() => {
				return TicketModel.update({ status: TicketModel.status.CANCELLED }, {
					where: { status: { $in: [ TicketModel.status.PENDING, TicketModel.status.SERVING ] } }
				})
			}).then(() => {
				// Return a 'No Content' response header indicating success
				res.sendStatus(204)

				// Broadcast on WebSocket that system status has been updated
				if (req.body.status === SYSTEM_STATUS.DISABLED) {
					broadcastTicketsUpdated(WS_MSG.SYSTEM_DISABLED)
				} else {
					broadcastTicketsUpdated(WS_MSG.SYSTEM_ENABLED)
				}

			}).catch(err => {
				console.error(err)
				res.sendStatus(500)
			})
		})
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
		KeyPairModel.getItem(KEYS.SYSTEM_STATUS).then(value => {
			if (value === SYSTEM_STATUS.DISABLED) {
				return res.sendStatus(503)
			}

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
					broadcastTicketsUpdated(WS_MSG.TICKETS_CREATED)
				})
			})
		}).catch(err => {
			console.error(err)
			res.sendStatus(500)
		})
	})

	app.put('/api/tickets/:id', (req, res) => {
		if (!req.user) {
			return res.sendStatus(403)
		}

		req.checkParams('id', 'Invalid ID').isInt()
		req.checkBody('key', 'Invalid key').notEmpty().isString()
		req.checkBody('secret', 'Invalid secret').notEmpty().isString()
		req.checkBody('status', 'Invalid status').isInt()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(422).json({ error: result.useFirstErrorOnly().array() })
			}

			req.sanitizeParams('id').toInt()
			req.sanitizeBody('key').escape()
			req.sanitizeBody('secret').escape()
			req.sanitizeBody('status').toInt()

			// Update the ticket as served
			TicketModel.update({ status: req.body.status }, {
				where: {
					id: req.params.id,
					key: req.body.key,
					secret: req.body.secret,
					status: { $ne: TicketModel.status.CANCELLED }
				}
			}).then(result => {
				if (result[0] !== 1) {
					return res.sendStatus(422)
				}

				// Return a 'No Content' response header indicating success
				res.sendStatus(204)

				// Broadcast on WebSocket that ticket(s) have been updated
				broadcastTicketsUpdated(WS_MSG.TICKETS_UPDATED)

				return Promise.resolve()
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
				broadcastTicketsUpdated(WS_MSG.TICKETS_UPDATED)

				return Promise.resolve()
			}).catch(err => {
				console.error(err)
				res.sendStatus(500)
			})
		})
	})

	app.get('/api/*', (req, res) => {
		res.sendStatus(404)
	})
}

export default setupAPI
