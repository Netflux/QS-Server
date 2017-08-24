const schema = {
	tables: [
		`CREATE TABLE IF NOT EXISTS Ticket (
			id INTEGER PRIMARY KEY ,
			key TEXT NOT NULL,
			number INTEGER NOT NULL,
			time_created UNSIGNED INTEGER NOT NULL,
			time_served UNSIGNED INTEGER,
			cancelled BOOLEAN NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS User (
			id INTEGER PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL
		)`
	],
	seeds: [
		`INSERT OR IGNORE INTO User (username, password) VALUES ('root', '12345')`
	]
}

export default schema
