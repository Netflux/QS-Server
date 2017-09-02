import Sequelize from 'sequelize'
import path from 'path'

const db = new Sequelize('QSDatabase', null, null, {
	dialect: 'sqlite',
	storage: path.join(__dirname, '../../../build/QSDatabase.sqlite'),
	logging: false
})

export default db
