import setupAPI from './api'
import setupWeb from './web'

// Helper function to initialize all routes for the Express application
const setupRoutes = (app, wss) => {
	setupAPI(app, wss)
	setupWeb(app)
}

export default setupRoutes
