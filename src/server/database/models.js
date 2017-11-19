import Sequelize from 'sequelize'
import KeyPairModel from 'node-persist'

import db from './db'
import { TICKET_STATUS, SYSTEM_STATUS, KEYS } from 'shared/constants'

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
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	},
	status: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false
	}
})

TicketModel.attrs = [ 'id', 'key', 'time_created', 'time_served', 'duration', 'status' ]
TicketModel.status = TICKET_STATUS

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

KeyPairModel.initSync({
	dir: 'build/keypairs'
})
if (KeyPairModel.valuesWithKeyMatch(KEYS.SYSTEM_STATUS).length === 0) {
	KeyPairModel.setItemSync(KEYS.SYSTEM_STATUS, SYSTEM_STATUS.DISABLED)
}
if (KeyPairModel.valuesWithKeyMatch(KEYS.SYSTEM_LOCATION).length === 0) {
	KeyPairModel.setItemSync(KEYS.SYSTEM_LOCATION, '')
}

export { TicketModel, UserModel, KeyPairModel }
