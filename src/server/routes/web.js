
const setupWeb = app => {
	app.get('*', (req, res) => {
		res.sendStatus(404)
	})
}

export default setupWeb
