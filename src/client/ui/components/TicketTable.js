import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { TICKET_STATUS } from 'shared/constants'
import './css/TicketTable.css'

const mapStateToProps = state => ({
	tickets: state.tickets
})

const TicketTable = ({ tickets }) => {
	// Get the current/next ticket, returning null if there are no servable tickets left
	const ticket = tickets.data.find(t => t.status === TICKET_STATUS.PENDING || t.status === TICKET_STATUS.SERVING)
	if (!ticket) { return null }

	const remainingTickets = tickets.data.filter(t => t.id >= ticket.id)
	const displayTickets = remainingTickets.slice(0, 10)

	return (
		<div className="ticket-table">
			<h2 className="text-center">Next Tickets</h2>
			<table>
				<thead>
					<tr>
						<th>No.</th>
						<th>Ticket</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{
						displayTickets.map((t, i) => (
							<tr key={t.id}>
								<td>{i + 1}</td>
								<td>{t.id}</td>
								<td>
									{(() => {
										switch (t.status) {
										case TICKET_STATUS.CANCELLED:
											return 'Cancelled'
										case TICKET_STATUS.PENDING:
											return 'Pending'
										case TICKET_STATUS.SERVING:
											return 'Serving'
										case TICKET_STATUS.SERVED:
											return 'Served'
										default:
											return 'Invalid'
										}
									})()}
								</td>
							</tr>
						))
					}
					{
						remainingTickets.length > 10 && (
							<tr className="text-center">
								<td colSpan="3">...and {remainingTickets.length - 10} others...</td>
							</tr>
						)
					}
				</tbody>
			</table>
		</div>
	)
}

TicketTable.propTypes = {
	tickets: PropTypes.object.isRequired
}

export default connect(mapStateToProps, null)(TicketTable)
