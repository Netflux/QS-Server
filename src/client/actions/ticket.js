export const fetchCurTicket = () => dispatch => {
	dispatch(requestCurTicket())

	return fetch('/api/tickets/current')
		.then(response => {
			if (response.ok) {
				return response.json()
			}
			throw new Error(`HTTP Error ${response.status}: Failed to fetch current ticket`)
		})
		.then(json => dispatch(receiveCurTicket(json.data)))
		.catch(err => {
			dispatch(receiveCurTicketError())
		})
}

export const REQUEST_CUR_TICKET = 'REQUEST_CUR_TICKET'
const requestCurTicket = () => ({
	type: REQUEST_CUR_TICKET
})

export const RECEIVE_CUR_TICKET = 'RECEIVE_CUR_TICKET'
const receiveCurTicket = id => ({
	type: RECEIVE_CUR_TICKET,
	payload: id
})

export const RECEIVE_CUR_TICKET_ERROR = 'RECEIVE_CUR_TICKET_ERROR'
const receiveCurTicketError = () => ({
	type: RECEIVE_CUR_TICKET_ERROR
})
