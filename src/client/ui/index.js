import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { NavBar, Footer } from './components'
import { HomePage, AboutPage, LoginPage, NotFoundPage } from './pages'
import { fetchCurTicket, handleCheckLogin } from '../actions'
import './index.css'

const mapStateToProps = state => ({
	ticketId: state.curTicket.id
})

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket()),
	handleCheckLogin: () => dispatch(handleCheckLogin())
})

class App extends React.Component {
	constructor(props) {
		super(props)

		this.ws = new WebSocket(`ws://${location.host}/`)
		this.ws.addEventListener('message', ({ data }) => {
			const shouldFetch = (data.includes('MSG_TICKETS_CREATED') && this.props.ticketId === -1) || data.includes('MSG_TICKETS_UPDATED')
			if (shouldFetch) {
				this.props.fetchCurTicket()
			}
		})
	}

	componentDidMount() {
		this.props.fetchCurTicket()
		this.props.handleCheckLogin()
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
			</div>
		)
	}
}

App.propTypes = {
	ticketId: PropTypes.number.isRequired,
	fetchCurTicket: PropTypes.func.isRequired,
	handleCheckLogin: PropTypes.func.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
