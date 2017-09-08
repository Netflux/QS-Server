import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fetchCurTicket } from '../../actions'
import './css/TicketTools.css'

const mapStateToProps = state => ({
	curTicket: state.curTicket
})

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket())
})

const TicketTools = ({ curTicket, fetchCurTicket }) => {
	const btnDisabled = (curTicket.lastFetched && curTicket.id === -1) || curTicket.isFetching

	return (
		<div className="ticket-tools grid">
			<div className="col"><button onClick={fetchCurTicket}>Refresh</button></div>
			{
				!btnDisabled && <div className="col"><button>Next Ticket</button></div>
			}
		</div>
	)
}

TicketTools.propTypes = {
	curTicket: PropTypes.object.isRequired,
	fetchCurTicket: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketTools)
