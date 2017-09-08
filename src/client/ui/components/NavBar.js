import React from 'react'
import { Link } from 'react-router-dom'

import './css/NavBar.css'

const NavBar = () => (
	<nav className="navbar grid-noGutter">
		<Link to={'/'}>QS Server</Link>
		<div className="col text-right">
			<Link to={'/'}>Home</Link>
			<Link to={'/about'}>About</Link>
			<Link to={'/login'}>Login</Link>
		</div>
	</nav>
)

export default NavBar
