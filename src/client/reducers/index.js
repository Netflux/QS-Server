import { combineReducers } from 'redux'

import {
	REQUEST_CUR_TICKET, RECEIVE_CUR_TICKET, RECEIVE_CUR_TICKET_ERROR,
	REQUEST_USER, RECEIVE_USER_SUCCESS, RECEIVE_USER_ERROR
} from '../actions'

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
	curTicket,
	user
})

export default rootReducer
