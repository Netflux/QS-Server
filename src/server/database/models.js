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
	cancelled: {
		type: Sequelize.BOOLEAN,
		allowNull: false
	}
})

// Ticket Logs used to keep track of tickets that have been updated
// When updating local databases, reduce bandwidth usage by only fetch updated tickets:
// 1. After an update, store the ID of the last Ticket Log processed
// 2. Fetch tickets where the Ticket Log ID is greater than the stored ID
const TicketLogModel = db.define('TicketLog', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	}
})

TicketLogModel.belongsTo(TicketModel, { foreignKey: 'ticket_id' })

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
})

export { TicketModel, TicketLogModel, UserModel }
