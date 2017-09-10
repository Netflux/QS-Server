export const handleCheckLogin = () => dispatch => {
	dispatch(requestUser())

	return fetch('/api/login', { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return dispatch(receiveUserSuccess(true))
			}
			throw new Error(`HTTP Error ${response.status}: No previous login`)
		}).catch(err => {
			dispatch(receiveUserSuccess(false))
		})
}

export const handleLogin = (username, password) => dispatch => {
	dispatch(requestUser())

	const options = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify({ username, password })
	}

	return fetch('/api/login', options)
		.then(response => {
			if (response.ok) {
				return dispatch(receiveUserSuccess(true))
			}
			throw new Error(`HTTP Error ${response.status}: Failed to login`)
		}).catch(err => {
			dispatch(receiveUserError())
		})
}

export const handleLogout = () => dispatch => {
	dispatch(requestUser())

	return fetch('/api/logout', { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return dispatch(receiveUserSuccess(false))
			}
			throw new Error(`HTTP Error ${response.status}: Failed to logout`)
		}).catch(err => {
			dispatch(receiveUserError())
		})
}

export const REQUEST_USER = 'REQUEST_USER'
const requestUser = () => ({
	type: REQUEST_USER
})

export const RECEIVE_USER_SUCCESS = 'RECEIVE_USER_SUCCESS'
const receiveUserSuccess = payload => ({
	type: RECEIVE_USER_SUCCESS,
	payload
})

export const RECEIVE_USER_ERROR = 'RECEIVE_USER_ERROR'
const receiveUserError = () => ({
	type: RECEIVE_USER_ERROR
})
