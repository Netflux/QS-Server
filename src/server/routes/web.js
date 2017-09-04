import Path from 'path'

const setupWeb = app => {
	app.get('*', (req, res) => {
		res.sendFile('index.html', { root: Path.join(__dirname, '../../../static') })
	})
}

export default setupWeb
