import Sequelize from 'sequelize'

const db = new Sequelize('QSDatabase', null, null, {
	dialect: 'sqlite',
	storage: 'build/QSDatabase.sqlite',
	logging: false
})

export default db
