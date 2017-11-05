import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { TICKET_STATUS, SYSTEM_STATUS } from 'shared/constants'
import { fetchTickets, cancelTicket, serveTicket, nextTicket, handleCheckSystem, updateSystemStatus, showAlertDialog } from 'client/actions'
import './css/TicketTools.css'

const mapStateToProps = state => ({
	tickets: state.tickets,
	system: state.system,
	isLoggedIn: state.user.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
	handleUpdate: () => {
		dispatch(fetchTickets())
		dispatch(handleCheckSystem())
	},
	cancelTicket: ticket => dispatch(cancelTicket(ticket)),
	serveTicket: ticket => dispatch(serveTicket(ticket)),
	nextTicket: () => dispatch(nextTicket()),
	updateSystemStatus: status => dispatch(updateSystemStatus(status)),
	showAlertDialog: () => dispatch(showAlertDialog({
		title: 'Close Queue',
		description: 'Closing the queue will cancel all pending tickets. Continue?',
		okAction: () => dispatch(updateSystemStatus(SYSTEM_STATUS.DISABLED))
	}))
})

const TicketTools = ({ tickets, system, isLoggedIn, handleUpdate, cancelTicket, serveTicket, nextTicket, updateSystemStatus, showAlertDialog }) => {
	const curTicket = tickets.data.find(t => t.status === TICKET_STATUS.SERVING)
	const pendingTicket = tickets.data.find(t => t.status === TICKET_STATUS.PENDING)
	return (
		<div className="ticket-tools grid">
			<div className="col"><button onClick={handleUpdate} disabled={tickets.isFetching}>Refresh</button></div>
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
			{
				isLoggedIn && !system.isFetching && (
					<div className="col-12">
						<button
							className={system.isEnabled ? 'button-cancel' : 'button-served'}
							onClick={() => system.isEnabled ? showAlertDialog() : updateSystemStatus(SYSTEM_STATUS.ENABLED)}>
								{system.isEnabled ? 'Close Queue' : 'Open Queue'}
						</button>
					</div>
				)
			}
		</div>
	)
}

TicketTools.propTypes = {
	tickets: PropTypes.object.isRequired,
	isLoggedIn: PropTypes.bool.isRequired,
	handleUpdate: PropTypes.func.isRequired,
	cancelTicket: PropTypes.func.isRequired,
	serveTicket: PropTypes.func.isRequired,
	nextTicket: PropTypes.func.isRequired,
	updateSystemStatus: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketTools)
