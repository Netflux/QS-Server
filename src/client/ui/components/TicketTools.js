import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { TICKET_STATUS } from 'shared/constants'
import { fetchTickets, cancelTicket, serveTicket, nextTicket } from 'client/actions'
import './css/TicketTools.css'

const mapStateToProps = state => ({
	tickets: state.tickets,
	isLoggedIn: state.user.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
	fetchTickets: () => dispatch(fetchTickets()),
	cancelTicket: ticket => dispatch(cancelTicket(ticket)),
	serveTicket: ticket => dispatch(serveTicket(ticket)),
	nextTicket: () => dispatch(nextTicket())
})

const TicketTools = ({ tickets, isLoggedIn, fetchTickets, cancelTicket, serveTicket, nextTicket }) => {
	const curTicket = tickets.data.find(t => t.status === TICKET_STATUS.SERVING)
	const pendingTicket = tickets.data.find(t => t.status === TICKET_STATUS.PENDING)
	return (
		<div className="ticket-tools grid">
			<div className="col"><button onClick={fetchTickets} disabled={tickets.isFetching}>Refresh</button></div>
			{
				isLoggedIn && curTicket && (
					<div className="col"><button className="button-cancel" onClick={() => cancelTicket(curTicket)} disabled={tickets.isFetching}>Cancel Ticket</button></div>
				)
			}
			{
				isLoggedIn && curTicket && (
					<div className="col"><button className="button-served" onClick={() => serveTicket(curTicket)} disabled={tickets.isFetching}>Served</button></div>
				)
			}
			{
				isLoggedIn && !curTicket && pendingTicket && (
					<div className="col"><button onClick={nextTicket} disabled={tickets.isFetching}>Next Ticket</button></div>
				)
			}
		</div>
	)
}

TicketTools.propTypes = {
	tickets: PropTypes.object.isRequired,
	isLoggedIn: PropTypes.bool.isRequired,
	fetchTickets: PropTypes.func.isRequired,
	cancelTicket: PropTypes.func.isRequired,
	serveTicket: PropTypes.func.isRequired,
	nextTicket: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketTools)
