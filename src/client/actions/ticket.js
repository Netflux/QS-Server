import { TICKET_STATUS } from 'shared/constants'

export const fetchTickets = (force, reloadAll) => (dispatch, getState) => {
	const state = getState().tickets
	if (!force && state.isFetching) {
		return Promise.resolve()
	}

	const time = Date.now()
	dispatch(requestTicket())

	return fetch(`/api/tickets?timestamp=${reloadAll ? 0 : state.lastFetched}`, { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return response.json()
			}
			throw new Error(`HTTP Error ${response.status}: Failed to fetch tickets`)
		}).then(json => {
			dispatch(receiveTickets(json.data, time))
		}).catch(() => {
			dispatch(responseTicketError())
		})
}

export const cancelTicket = ticket => (dispatch, getState) => {
	const isFetching = getState().tickets.isFetching
	if (isFetching) {
		return Promise.resolve()
	}

	return fetch(`/api/tickets/${ticket.id}`, {
		headers: { 'Content-Type': 'application/json' },
		method: 'DELETE',
		credentials: 'include',
		body: JSON.stringify({
			key: ticket.key,
			secret: ticket.secret
		})
	}).then(response => {
		if (response.ok) {
			return
		}
		throw new Error(`HTTP Error ${response.status}: Failed to delete ticket with ID ${ticket.id}`)
	}).catch(() => {
		// No action required
	})
}

const updateTicket = (ticket, status) => (dispatch, getState) => {
	const isFetching = getState().tickets.isFetching
	if (isFetching) {
		return Promise.resolve()
	}

	return fetch(`/api/tickets/${ticket.id}`, {
		headers: { 'Content-Type': 'application/json' },
		method: 'PUT',
		credentials: 'include',
		body: JSON.stringify({
			key: ticket.key,
			secret: ticket.secret,
			status
		})
	}).then(response => {
		if (response.ok) {
			return
		}
		throw new Error(`HTTP Error ${response.status}: Failed to update ticket with ID ${ticket.id}`)
	}).catch(() => {
		// No action required
	})
}

export const serveTicket = ticket => dispatch => dispatch(updateTicket(ticket, TICKET_STATUS.SERVED))

export const nextTicket = () => (dispatch, getState) => {
	const pendingTicket = getState().tickets.data.find(t => t.status === TICKET_STATUS.PENDING)
	return dispatch(updateTicket(pendingTicket, TICKET_STATUS.SERVING))
}

export const REQUEST_TICKET = 'REQUEST_TICKET'
const requestTicket = () => ({
	type: REQUEST_TICKET
})

export const RESPONSE_TICKET_ERROR = 'RESPONSE_TICKET_ERROR'
const responseTicketError = () => ({
	type: RESPONSE_TICKET_ERROR
})

export const RECEIVE_TICKETS = 'RECEIVE_TICKETS'
const receiveTickets = (tickets, time) => ({
	type: RECEIVE_TICKETS,
	payload: tickets,
	time
})
