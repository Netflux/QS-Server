import Passport from 'passport'
import WebSocket from 'ws'

import db from '../database/db'
import { TicketModel, TicketLogModel } from '../database/models'

const ticketAttrs = [ 'id', 'key', 'time_created', 'time_served', 'duration', 'cancelled' ]
const ticketLogAttrs = [ 'id', 'ticket_id' ]

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

	const getCurrentTicket = () => TicketModel.findOne({
		attributes: ticketAttrs,
		where: {
			time_served: null,
			duration: null,
			cancelled: false
		},
		order: [ [ 'id', 'ASC' ] ]
	})

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
				return res.status(400).json({
					error: result.useFirstErrorOnly().array()
				})
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
		if (req.query.lastID) {
			req.checkQuery('lastID', 'Invalid lastID').isInt()

			req.getValidationResult().then(result => {
				if (!result.isEmpty()) {
					return res.status(400).json({
						error: result.useFirstErrorOnly().array()
					})
				}

				req.sanitizeQuery('lastID').toInt()

				TicketLogModel.findAll({
					attributes: ticketLogAttrs,
					where: {
						id: { $gt: req.query.lastID }
					},
					order: [ [ 'id', 'ASC' ] ]
				}).then(ticketLogs => {
					return {
						lastID: ticketLogs.length > 0 ? ticketLogs[ticketLogs.length - 1].id : -1,
						ticketIds: ticketLogs.map(log => log.ticket_id)
							.filter((log, i, array) => array.indexOf(log) === i)
					}
				}).then(({ lastID, ticketIds }) => {
					return TicketModel.findAll({
						attributes: ticketAttrs,
						where: {
							id: { $in: ticketIds }
						},
						order: [ [ 'id', 'ASC' ] ]
					}).then(tickets => {
						return {
							lastID,
							data: tickets
						}
					})
				}).then(payload => {
					return res.json(payload)
				}).catch(err => {
					console.error(err)
					return res.sendStatus(500)
				})
			})
		} else {
			TicketModel.findAll({
				attributes: ticketAttrs,
				order: [ [ 'id', 'ASC' ] ]
			}).then(tickets => {
				return TicketLogModel.findOne({
					attributes: ticketLogAttrs,
					order: [ [ 'id', 'DESC' ] ]
				}).then(log => {
					return res.json({
						lastID: log ? log.id : -1,
						data: tickets
					})
				})
			}).catch(err => {
				console.error(err)
				return res.sendStatus(500)
			})
		}
	})

	app.post('/api/tickets', (req, res) => {
		req.checkBody('key', 'Invalid key').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(400).json({
					error: result.useFirstErrorOnly().array()
				})
			}

			req.sanitizeBody('key').escape()

			getCurrentTicket().then(ticket => {
				if (ticket && ticket.key === req.body.key) {
					// Return the new ticket data in the response
					return res.json({ data: ticket })
				}

				db.transaction(t => {
					// Create a new ticket
					return TicketModel.create({
						key: req.body.key,
						time_created: Date.now(),
						cancelled: false
					}, { transaction: t }).then(ticket => {
						// Create a ticket log entry
						return TicketLogModel.create({
							ticket_id: ticket.id
						}, { transaction: t }).then(() => {
							return ticket
						})
					})
				}).then(ticket => {
					// Return the new ticket data in the response
					res.status(201).json({
						data: {
							id: ticket.id,
							key: ticket.key,
							time_created: ticket.time_created,
							time_served: null,
							duration: null,
							cancelled: ticket.cancelled
						}
					})

					// Broadcast on WebSocket that ticket(s) have been updated
					broadcastTicketsUpdated(MSG_TICKETS_CREATED)
				}).catch(err => {
					console.error(err)
					return res.sendStatus(500)
				})
			}).catch(err => {
				console.error(err)
				return res.sendStatus(500)
			})
		})
	})

	app.delete('/api/tickets/:id', (req, res) => {
		req.checkParams('id', 'Invalid ID').isInt()
		req.checkBody('key', 'Invalid key').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(400).json({
					error: result.useFirstErrorOnly().array()
				})
			}

			req.sanitizeParams('id').toInt()
			req.sanitizeBody('key').escape()

			db.transaction(t => {
				// Update the ticket as cancelled
				return TicketModel.update({ cancelled: true }, {
					where: {
						id: req.params.id,
						key: req.body.key
					},
					transaction: t
				}).then(result => {
					if (result[0] !== 1) {
						throw new Error(`Invalid number of tickets cancelled: ${result[0]}`)
					}

					// Create a ticket log entry
					return TicketLogModel.create({
						ticket_id: req.params.id
					}, { transaction: t })
				})
			}).then(() => {
				// Return a 'No Content' response header indicating success
				res.sendStatus(204)

				// Broadcast on WebSocket that ticket(s) have been updated
				broadcastTicketsUpdated(MSG_TICKETS_UPDATED)
			}).catch(err => {
				console.error(err)
				return res.sendStatus(400)
			})
		})
	})

	app.get('/api/tickets/current', (req, res) => {
		getCurrentTicket().then(ticket => {
			res.json({ data: ticket })
		}).catch(err => {
			console.error(err)
			return res.sendStatus(500)
		})
	})

	app.get('/api/tickets/next', (req, res) => {
		if (!req.user) {
			return res.sendStatus(403)
		}

		db.transaction(t => {
			// Update the ticket as cancelled
			return getCurrentTicket().then(ticket => {
				if (!ticket) {
					// All tickets have been served, end transaction
					return true
				}

				return TicketModel.update({ cancelled: true }, {
					where: { id: ticket.id },
					order: [ [ 'id', 'ASC' ] ],
					limit: 1,
					transaction: t
				}).then(result => {
					if (result[0] !== 1) {
						throw new Error(`Invalid number of tickets cancelled: ${result[0]}`)
					}

					// Create a ticket log entry
					return TicketLogModel.create({
						ticket_id: ticket.id
					}, { transaction: t })
				})
			})
		}).then(() => {
			// Return a 'No Content' response header indicating success
			res.sendStatus(204)

			// Broadcast on WebSocket that ticket(s) have been updated
			broadcastTicketsUpdated(MSG_TICKETS_UPDATED)
		}).catch(err => {
			console.error(err)
			return res.sendStatus(400)
		})
	})

	app.get('/api/*', (req, res) => {
		res.sendStatus(404)
	})
}

export default setupAPI
