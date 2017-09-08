import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fetchCurTicket } from '../../actions'
import './css/TicketTools.css'

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket())
})

const TicketTools = ({ fetchCurTicket }) => (
	<div className="ticket-tools grid">
		<div className="col"><button onClick={fetchCurTicket}>Refresh</button></div>
		<div className="col"><button>Next Ticket</button></div>
	</div>
)

TicketTools.propTypes = {
	fetchCurTicket: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(TicketTools)
