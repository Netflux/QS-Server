import db from './database/db'
import { TicketModel, TicketLogModel, UserModel } from './database/models'

const ticketAttrs = [ 'id', 'key', 'time_created', 'time_served', 'duration', 'cancelled' ]
const ticketLogAttrs = [ 'id', 'ticket_id' ]

// Helper function to initialize all routes for the Express application
const loadRoutes = app => {
	app.get('/api/tickets', (req, res) => {
		if (req.query.lastID) {
			req.checkQuery('lastID', 'Invalid lastID').isInt()

			req.getValidationResult().then(result => {
				if (!result.isEmpty()) {
					return res.status(400).json({
						error: 'Invalid Parameter(s)',
						fields: [ 'lastID' ]
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
						lastID: ticketLogs.length > 0 ? ticketLogs[ticketLogs.length - 1].id : null,
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
		if (!req.body) {
			return res.status(400).json({
				error: 'Missing Parameter(s)',
				fields: [ 'key' ]
			})
		}

		req.checkBody('key', 'Invalid key').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.status(400).json({
					error: 'Invalid Parameter(s)',
					fields: [ 'key' ]
				})
			}

			req.sanitizeBody('key').escape()

			db.transaction(t => {
				// Create a new ticket
				return TicketModel.create({
					key: req.body.key,
					time_created: Date.now(),
					cancelled: false
				}, { transaction: t }).then(ticket => {
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

					// Create a ticket log entry
					return TicketLogModel.create({
						ticket_id: ticket.id
					}, { transaction: t })
				})
			}).catch(err => {
				console.error(err)
				return res.sendStatus(500)
			})
		})
	})

	app.get('/api/tickets/current', (req, res) => {
		TicketModel.findOne({
			attributes: ticketAttrs,
			where: {
				time_served: null,
				duration: null,
				cancelled: false
			},
			order: [ [ 'id', 'ASC' ] ]
		}).then(ticket => {
			return res.json({ data: ticket })
		}).catch(err => {
			console.error(err)
			return res.sendStatus(500)
		})
	})
}

export default loadRoutes
