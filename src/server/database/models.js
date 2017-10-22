import Sequelize from 'sequelize'

import db from './db'

const TicketModel = db.define('Ticket', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	key: {
		type: Sequelize.STRING,
		allowNull: false
	},
	secret: {
		type: Sequelize.STRING,
		allowNull: false
	},
	time_created: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	},
	time_served: {
		type: Sequelize.INTEGER.UNSIGNED
	},
	duration: {
		type: Sequelize.INTEGER.UNSIGNED
	},
	status: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	}
})

TicketModel.attrs = [ 'id', 'key', 'time_created', 'time_served', 'duration', 'status' ]
TicketModel.status = {
	CANCELLED: 0,
	PENDING: 1,
	SERVING: 2,
	SERVED: 3
}

const UserModel = db.define('User', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	}
}, { timestamps: false })

export { TicketModel, UserModel }
