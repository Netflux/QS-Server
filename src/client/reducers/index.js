import { combineReducers } from 'redux'

import {
	REQUEST_TICKET, RESPONSE_TICKET_ERROR, RECEIVE_TICKETS,
	REQUEST_USER, RECEIVE_USER_SUCCESS, RECEIVE_USER_ERROR,
	REQUEST_SYSTEM_STATUS, RECEIVE_SYSTEM_STATUS_SUCCESS, RECEIVE_SYSTEM_STATUS_ERROR,
	SHOW_ALERT_DIALOG, HIDE_ALERT_DIALOG
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

const system = (state = {
	isFetching: false,
	isEnabled: false,
	location: '',
	remaining: 0
}, action) => {
	switch (action.type) {
	case REQUEST_SYSTEM_STATUS:
		return {
			...state,
			isFetching: true
		}
	case RECEIVE_SYSTEM_STATUS_SUCCESS:
		return {
			...state,
			isFetching: false,
			isEnabled: action.status,
			location: action.location,
			remaining: action.remaining
		}
	case RECEIVE_SYSTEM_STATUS_ERROR:
		return {
			...state,
			isFetching: false
		}
	}
	return state
}

const ui = (state = {
	alertDialog: alertDialog(undefined, {})
}, action) => {
	switch (action.type) {
	case SHOW_ALERT_DIALOG:
	case HIDE_ALERT_DIALOG:
		return {
			...state,
			alertDialog: alertDialog(state.alertDialog, action)
		}
	}
	return state
}

const alertDialog = (state = {
	title: '',
	description: '',
	okAction: false,
	cancelAction: false,
	isShowing: false
}, action) => {
	switch (action.type) {
	case SHOW_ALERT_DIALOG:
		return {
			...state,
			...action.payload,
			isShowing: true
		}
	case HIDE_ALERT_DIALOG:
		return {
			title: '',
			description: '',
			okAction: false,
			cancelAction: false,
			isShowing: false
		}
	}
	return state
}

const rootReducer = combineReducers({
	tickets,
	user,
	system,
	ui
})

export default rootReducer
