export const handleCheckSystem = () => (dispatch, getState) => {
	if (getState().system.isFetching) {
		return Promise.resolve()
	}

	dispatch(requestSystemStatus())

	return fetch('/api/system', { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return dispatch(receiveSystemStatusSuccess(true))
			} else if (response.status === 503) {
				return dispatch(receiveSystemStatusSuccess(false))
			}
			throw new Error(`HTTP Error ${response.status}: Unable to fetch system status`)
		}).catch(() => {
			dispatch(receiveSystemStatusError())
		})
}

export const updateSystemStatus = status => (dispatch, getState) => {
	if (getState().system.isFetching) {
		return Promise.resolve()
	}

	dispatch(requestSystemStatus())

	return fetch('/api/system', {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify({ status })
	}).then(response => {
		if (response.ok) {
			dispatch(receiveSystemStatusError())
			return dispatch(handleCheckSystem())
		}
		throw new Error(`HTTP Error ${response.status}: Unable to fetch system status`)
	}).catch(() => {
		dispatch(receiveSystemStatusError())
	})
}

export const REQUEST_SYSTEM_STATUS = 'REQUEST_SYSTEM_STATUS'
export const requestSystemStatus = () => ({
	type: REQUEST_SYSTEM_STATUS
})

export const RECEIVE_SYSTEM_STATUS_SUCCESS = 'RECEIVE_SYSTEM_STATUS_SUCCESS'
export const receiveSystemStatusSuccess = payload => ({
	type: RECEIVE_SYSTEM_STATUS_SUCCESS,
	payload
})

export const RECEIVE_SYSTEM_STATUS_ERROR = 'RECEIVE_SYSTEM_STATUS_ERROR'
export const receiveSystemStatusError = () => ({
	type: RECEIVE_SYSTEM_STATUS_ERROR
})
