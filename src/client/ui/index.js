import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { NavBar, Footer, AlertDialog } from './components'
import { HomePage, AboutPage, LoginPage, NotFoundPage } from './pages'
import { fetchTickets, handleCheckLogin, handleCheckSystem } from 'client/actions'
import './index.css'

const mapDispatchToProps = dispatch => ({
	fetchTickets: () => dispatch(fetchTickets(true)),
	handleCheckLogin: () => dispatch(handleCheckLogin()),
	handleCheckSystem: () => dispatch(handleCheckSystem())
})

class App extends React.Component {
	setupWebSocket() {
		const reconnectHandler = () => {
			clearTimeout(this.WebSocketTimeout)
			this.WebSocketTimeout = setTimeout(() => this.setupWebSocket(), 10000)
		}

		this.ws = new WebSocket(`ws://${location.host}/`)
		this.ws.addEventListener('message', () => this.props.fetchTickets())
		this.ws.addEventListener('open', () => this.props.fetchTickets())
		this.ws.addEventListener('close', reconnectHandler)
		this.ws.addEventListener('error', reconnectHandler)
	}

	componentDidMount() {
		this.props.handleCheckLogin()
		this.props.handleCheckSystem()
		this.setupWebSocket()
	}

	componentWillUnmount() {
		this.ws.close()
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

				<AlertDialog/>
			</div>
		)
	}
}

App.propTypes = {
	fetchTickets: PropTypes.func.isRequired,
	handleCheckLogin: PropTypes.func.isRequired,
	handleCheckSystem: PropTypes.func.isRequired
}

export default withRouter(connect(null, mapDispatchToProps)(App))
