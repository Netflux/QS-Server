import Sequelize from 'sequelize'
import path from 'path'

const db = new Sequelize('QSDatabase', null, null, {
	dialect: 'sqlite',
	storage: path.join(__dirname, '../../../dist/server/database/QSDatabase.sqlite')
})

export default db
