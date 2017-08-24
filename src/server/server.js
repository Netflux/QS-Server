import Express from 'express'
import bodyParser from 'body-parser'
import ExpressValidator from 'express-validator'

import loadRoutes from './routes'

// Create a new instance of the Express application
const app = Express()
const port = process.env.PORT || 3000

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
loadRoutes(app)

app.listen(port, err => {
	if (err) {
		console.error(err)
	} else {
		console.log(`QS-Server listening on port ${port}.`)
	}
})
