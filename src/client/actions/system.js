import { SYSTEM_STATUS } from 'shared/constants'

export const handleCheckSystem = () => (dispatch, getState) => {
	if (getState().system.isFetching) {
		return Promise.resolve()
	}

	dispatch(requestSystemStatus())

	return fetch('/api/system', { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return response.json()
			}
			throw new Error(`HTTP Error ${response.status}: Unable to fetch system status`)
		}).then(json => {
			const status = json.data.status === SYSTEM_STATUS.ENABLED
			return dispatch(receiveSystemStatusSuccess(status, json.data.location, json.data.remaining))
		}).catch(() => {
			dispatch(receiveSystemStatusError())
		})
}

export const updateSystemStatus = (status, location, remaining) => (dispatch, getState) => {
	if (getState().system.isFetching) {
		return Promise.resolve()
	}

	dispatch(requestSystemStatus())

	return fetch('/api/system', {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify({
			status,
			location,
			remaining
		})
	}).then(response => {
		if (response.ok) {
			dispatch(receiveSystemStatusError())
			return dispatch(handleCheckSystem())
		}
		throw new Error(`HTTP Error ${response.status}: Unable to update system status`)
	}).catch(() => {
		dispatch(receiveSystemStatusError())
	})
}

export const REQUEST_SYSTEM_STATUS = 'REQUEST_SYSTEM_STATUS'
export const requestSystemStatus = () => ({
	type: REQUEST_SYSTEM_STATUS
})

export const RECEIVE_SYSTEM_STATUS_SUCCESS = 'RECEIVE_SYSTEM_STATUS_SUCCESS'
export const receiveSystemStatusSuccess = (status, location, remaining) => ({
	type: RECEIVE_SYSTEM_STATUS_SUCCESS,
	status,
	location,
	remaining
})

export const RECEIVE_SYSTEM_STATUS_ERROR = 'RECEIVE_SYSTEM_STATUS_ERROR'
export const receiveSystemStatusError = () => ({
	type: RECEIVE_SYSTEM_STATUS_ERROR
})
