import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import LoadRipple from './LoadRipple'
import './css/TicketDisplay.css'

const mapStateToProps = state => ({
	curTicket: state.curTicket
})

const TicketDisplay = ({ curTicket }) => {
	if (curTicket.id > -1 || !curTicket.lastFetched || curTicket.isFetching) {
		return (
			<div className="ticket-display text-center">
				<h1>Currently Serving:</h1>
				{
					curTicket.id > -1 ? (
						<p className="margin-none">{curTicket.id}</p>
					) : (
						<LoadRipple size={150}/>
					)
				}
			</div>
		)
	}

	return (
		<div className="ticket-display text-center">
			<h1>All tickets served!</h1>
			<img src="/images/task-done-flat.svg" alt="Tickets Served Image"/>
		</div>
	)
}

TicketDisplay.propTypes = {
	curTicket: PropTypes.object.isRequired
}

export default connect(mapStateToProps, null)(TicketDisplay)
