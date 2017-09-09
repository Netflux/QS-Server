import Session from 'express-session'
import Passport from 'passport'
import LocalStrategy from 'passport-local'
import SequelizeStore from 'connect-session-sequelize'
import Crypto from 'crypto'

import { UserModel } from './database/models'

const hashPassword = password => new Promise((fulfill, reject) => {
	Crypto.randomBytes(16, (err, salt) => {
		if (err) { return reject(err) }
		Crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, key) => {
			if (err) { return reject(err) }
			fulfill(salt + key)
		})
	})
})

const verifyPassword = (password, combined) => new Promise((fulfill, reject) => {
	const salt = combined.slice(0, 16)
	const hash = combined.slice(16, combined.length)

	Crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, key) => {
		if (err) { return reject(err) }
		fulfill(key === hash)
	})
})

// Helper functions for finding users based on ID or username
const findUserById = id => UserModel.findOne({ where: { id } })
const findUserByUsername = username => UserModel.findOne({ where: { username } })

const setupAuth = (app, db) => {
	const storeBuilder = SequelizeStore(Session.Store)
	const store = new storeBuilder({ db })
	store.sync()

	// Allow persistent sessions by providing serialize/deserialize methods for user data
	Passport.serializeUser((user, done) => done(null, user.id))
	Passport.deserializeUser((id, done) => findUserById(id).then(user => done(null, user)).catch(err => done(err)))

	// Set up the LocalStrategy for login authentication
	Passport.use(new LocalStrategy((username, password, done) => {
		findUserByUsername(username).then(user => {
			if (!user) { return done(null, false, { message: 'Invalid username or password' }) }
			return verifyPassword(password, user.password)
		}).then(res => {
			if (!res) { return done(null, false, { message: 'Invalid username or password' }) }
			return done(null, user)
		}).catch(err => done(err))
	}))

	app.use(Session({
		cookie: {
			maxAge: 604800000 // Persist session cookie for 7 days
		},
		resave: false,
		saveUninitialized: false,
		secret: 'qs-server',
		store
	}))
	app.use(Passport.initialize())
	app.use(Passport.session())
}

export { setupAuth, hashPassword }
