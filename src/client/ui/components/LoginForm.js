import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router'
import { connect } from 'react-redux'

import PageHeader from './PageHeader'
import { handleLogin } from 'client/actions'
import './css/LoginForm.css'

const mapStateToProps = state => ({
	user: state.user
})

const mapDispatchToProps = dispatch => ({
	handleLogin: (username, password) => dispatch(handleLogin(username, password))
})

const LoginForm = ({ user, handleLogin }) => {
	let usernameDOM, passwordDOM

	if (user.isLoggedIn) {
		return (
			<Redirect to="/"/>
		)
	}

	return (
		<div className="login-form">
			<PageHeader title="Login"/>
			<hr/>

			{ user.error && <div className="error">Invalid username or password</div> }

			<p><label htmlFor="username">Username</label></p>
			<p><input id="username" name="username" type="text" ref={input => usernameDOM = input}/></p>

			<p><label htmlFor="password">Password</label></p>
			<p><input id="password" name="password" type="password" ref={input => passwordDOM = input}/></p>

			<button onClick={() => handleLogin(usernameDOM.value, passwordDOM.value)} disabled={user.isFetching}>Submit</button>
		</div>
	)
}

LoginForm.propTypes = {
	user: PropTypes.object.isRequired,
	handleLogin: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
