import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router'
import { connect } from 'react-redux'

import { NavBar, Footer } from './components'
import { HomePage, AboutPage, NotFoundPage } from './pages'
import { fetchCurTicket } from '../actions'
import './index.css'

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket())
})

class App extends React.Component {
	componentDidMount() {
		this.props.fetchCurTicket()
	}

	render() {
		return (
			<div id="content">
				<NavBar/>

				<Switch>
					<Route exact path="/" component={HomePage}/>
					<Route exact path="/about" component={AboutPage}/>
					<Route component={NotFoundPage}/>
				</Switch>

				<Footer/>
			</div>
		)
	}
}

App.propTypes = {

}

export default connect(null, mapDispatchToProps)(App)
