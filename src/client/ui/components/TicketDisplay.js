import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { TICKET_STATUS } from 'shared/constants'
import LoadRipple from './LoadRipple'
import './css/TicketDisplay.css'

const mapStateToProps = state => ({
	tickets: state.tickets,
	system: state.system
})

const TicketDisplay = ({ tickets, system }) => {
	if (!system.isFetching && !system.isEnabled) {
		return (
			<div className="ticket-display text-center">
				<h1>Queue Closed</h1>
				<img src="/images/closed-flat.svg" alt="Queue Closed Image"/>
			</div>
		)
	}

	const ticket = tickets.data.find(t => t.status === TICKET_STATUS.PENDING || t.status === TICKET_STATUS.SERVING)
	if (tickets.lastFetched && !tickets.isFetching && !ticket) {
		return (
			<div className="ticket-display text-center">
				<h1>All tickets served!</h1>
				<img src="/images/task-done-flat.svg" alt="Tickets Served Image"/>
			</div>
		)
	}

	return (
		<div className="ticket-display text-center">
			<h1>Currently Serving:</h1>
			{(() => {
				if (tickets.isFetching || system.isFetching) {
					return (
						<LoadRipple size={150}/>
					)
				}

				const curTicket = tickets.data.find(t => t.status === TICKET_STATUS.SERVING)
				return (
					<p className="margin-none">{curTicket ? curTicket.id : '-'}</p>
				)
			})()}
		</div>
	)
}

TicketDisplay.propTypes = {
	tickets: PropTypes.object.isRequired,
	system: PropTypes.object.isRequired
}

export default connect(mapStateToProps, null)(TicketDisplay)
