import db from './database/db'

// Helper function to initialize all routes for the Express application
const loadRoutes = app => {
	app.get('/api/tickets/:key', (req, res) => {
		req.checkParams('key', 'Invalid key').notEmpty().isString()

		req.getValidationResult().then(result => {
			if (!result.isEmpty()) {
				return res.sendStatus(400)
			}

			req.sanitizeParams('key').escape()

			db.all(`SELECT * FROM Ticket WHERE key = ?`, [ req.params.key ], (err, rows) => {
				if (err) {
					console.error(err)
					return res.sendStatus(500)
				}

				return res.json({ data: rows })
			})
		})
	})
}

export default loadRoutes
