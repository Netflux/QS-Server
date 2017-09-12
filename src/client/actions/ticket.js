export const fetchCurTicket = force => (dispatch, getState) => {
	if (!force && getState().isFetching) {
		return Promise.resolve()
	}

	dispatch(requestTicket())

	return fetch('/api/tickets/current')
		.then(response => {
			if (response.ok) {
				return response.json()
			}
			throw new Error(`HTTP Error ${response.status}: Failed to fetch current ticket`)
		}).then(json => {
			dispatch(receiveCurTicket(json.data ? json.data.id : -1))
		}).catch(() => {
			dispatch(receiveTicketError())
		})
}

export const fetchNextTicket = () => (dispatch, getState) => {
	if (getState().isFetching) {
		return Promise.resolve()
	}

	dispatch(requestTicket())

	return fetch('/api/tickets/next', { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return dispatch(fetchCurTicket(true))
			}
			throw new Error(`HTTP Error ${response.status}: Failed to fetch next ticket`)
		}).catch(() => {
			dispatch(receiveTicketError())
		})
}

export const REQUEST_TICKET = 'REQUEST_TICKET'
const requestTicket = () => ({
	type: REQUEST_TICKET
})

export const RECEIVE_CUR_TICKET = 'RECEIVE_CUR_TICKET'
const receiveCurTicket = id => ({
	type: RECEIVE_CUR_TICKET,
	payload: id
})

export const RECEIVE_TICKET_ERROR = 'RECEIVE_TICKET_ERROR'
const receiveTicketError = () => ({
	type: RECEIVE_TICKET_ERROR
})
