import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fetchCurTicket, fetchNextTicket } from '../../actions'
import './css/TicketTools.css'

const mapStateToProps = state => ({
	curTicket: state.curTicket
})

const mapDispatchToProps = dispatch => ({
	fetchCurTicket: () => dispatch(fetchCurTicket()),
	fetchNextTicket: () => dispatch(fetchNextTicket())
})

const TicketTools = ({ curTicket, fetchCurTicket, fetchNextTicket }) => (
	<div className="ticket-tools grid">
		<div className="col"><button onClick={fetchCurTicket} disabled={curTicket.isFetching}>Refresh</button></div>
		{
			!(curTicket.lastFetched && curTicket.id === -1) && (
				<div className="col"><button onClick={fetchNextTicket} disabled={curTicket.isFetching}>Next Ticket</button></div>
			)
		}
	</div>
)

TicketTools.propTypes = {
	curTicket: PropTypes.object.isRequired,
	fetchCurTicket: PropTypes.func.isRequired,
	fetchNextTicket: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketTools)
