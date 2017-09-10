import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { NavBar, Footer } from './components'
import { HomePage, AboutPage, LoginPage, NotFoundPage } from './pages'
import { fetchCurTicket, handleCheckLogin } from '../actions'
import './index.css'

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket()),
	handleCheckLogin: () => dispatch(handleCheckLogin())
})

class App extends React.Component {
	componentDidMount() {
		this.props.fetchCurTicket()
		this.props.handleCheckLogin()
	}

	render() {
		return (
			<div id="content">
				<NavBar/>

				<Switch>
					<Route exact path="/" component={HomePage}/>
					<Route exact path="/about" component={AboutPage}/>
					<Route exact path="/login" component={LoginPage}/>
					<Route component={NotFoundPage}/>
				</Switch>

				<Footer/>
			</div>
		)
	}
}

App.propTypes = {
	fetchCurTicket: PropTypes.func.isRequired,
	handleCheckLogin: PropTypes.func.isRequired
}

export default withRouter(connect(null, mapDispatchToProps)(App))
