import React from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { handleLogout } from 'client/actions'
import './css/NavBar.css'

const mapStateToProps = state => ({
	user: state.user
})

const mapDispatchToProps = dispatch => ({
	handleLogout: () => dispatch(handleLogout())
})

const NavBar = ({ user, handleLogout }) => (
	<nav className="navbar grid-noGutter">
		<Link to={'/'}>QS Server</Link>
		<div className="col text-right">
			<NavLink exact to={'/'} activeClassName="active">Home</NavLink>
			<NavLink exact to={'/about'} activeClassName="active">About</NavLink>
			{
				user.isLoggedIn ? (
					<span onClick={handleLogout}>Logout</span>
				) : (
					<NavLink exact to={'/login'} activeClassName="active">Login</NavLink>
				)
			}
		</div>
	</nav>
)

NavBar.propTypes = {
	user: PropTypes.object.isRequired,
	handleLogout: PropTypes.func.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar))
