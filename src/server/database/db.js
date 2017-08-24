import sqlite from 'sqlite3'
import path from 'path'

import schema from './schema'

const db = new sqlite.Database(path.join(__dirname, '../../../dist/server/database/sqliteDB.sqlite'))

db.serialize(() => {
	// Create the tables defined in the schema
	schema.tables.map(statement => {
		db.run(statement)
	})

	// Initialize the tables with seed data
	schema.seeds.map(statement => {
		db.run(statement)
	})
})

export default db
