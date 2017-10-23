import { combineReducers } from 'redux'

import {
	REQUEST_TICKET, RESPONSE_TICKET_ERROR, RECEIVE_TICKETS,
	REQUEST_USER, RECEIVE_USER_SUCCESS, RECEIVE_USER_ERROR
} from 'client/actions'

const tickets = (state = {
	lastFetched: 0,
	isFetching: false,
	data: []
}, action) => {
	switch (action.type) {
	case REQUEST_TICKET:
		return {
			...state,
			isFetching: true
		}
	case RESPONSE_TICKET_ERROR:
		return {
			...state,
			isFetching: false
		}
	case RECEIVE_TICKETS: {
		const removeIds = action.payload.map(t => t.id)
		const tickets = state.data.filter(t => !removeIds.includes(t.id))
		return {
			...state,
			lastFetched: action.time,
			isFetching: false,
			data: [ ...tickets, ...action.payload ].sort((a, b) => a.id - b.id)
		}
	}
	}
	return state
}

const user = (state = {
	isFetching: false,
	isLoggedIn: false,
	error: false
}, action) => {
	switch (action.type) {
	case REQUEST_USER:
		return {
			...state,
			isFetching: true,
			error: false
		}
	case RECEIVE_USER_SUCCESS:
		return {
			...state,
			isFetching: false,
			isLoggedIn: action.payload
		}
	case RECEIVE_USER_ERROR:
		return {
			...state,
			isFetching: false,
			error: true
		}
	}
	return state
}

const rootReducer = combineReducers({
	tickets,
	user
})

export default rootReducer
