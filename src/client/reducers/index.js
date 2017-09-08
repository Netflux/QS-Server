import { combineReducers } from 'redux'

import { REQUEST_CUR_TICKET, RECEIVE_CUR_TICKET, RECEIVE_CUR_TICKET_ERROR } from '../actions'

const curTicket = (state = {
	lastFetched: false,
	isFetching: false,
	id: -1
}, action) => {
	switch (action.type) {
		case REQUEST_CUR_TICKET:
			return {
				...state,
				isFetching: true
			}
		case RECEIVE_CUR_TICKET:
			return {
				...state,
				lastFetched: Date.now(),
				isFetching: false,
				id: action.payload
			}
		case RECEIVE_CUR_TICKET_ERROR:
			return {
				...state,
				isFetching: false
			}
	}
	return state
}

const rootReducer = combineReducers({
	curTicket
})

export default rootReducer
