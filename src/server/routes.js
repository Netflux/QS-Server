import db from './database/db'
import { TicketModel, TicketLogModel, UserModel } from './database/models'

const ticketAttrs = { attributes: [ 'id', 'key', 'time_created', 'time_served', 'duration', 'cancelled' ] }
const ticketLogAttrs = { attributes: [ 'id', 'ticket_id' ] }

// Helper function to initialize all routes for the Express application
const loadRoutes = app => {
	app.get('/api/tickets', (req, res) => {
		TicketModel.findAll(ticketAttrs).then(tickets => {
			return res.json({ data: tickets })
		})
		.catch(err => {
			console.error(err)
			return res.sendStatus(500)
		})
	})

	app.post('/api/tickets', (req, res) => {
		if (!req.body) {
			return res.sendStatus(400)
		}

		req.checkBody('key', 'Invalid key').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.sendStatus(400)
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
					res.json({
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
			})
			.catch(err => {
				console.error(err)
				return res.sendStatus(500)
			})
		})
	})
}

export default loadRoutes
