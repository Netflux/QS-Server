export const SHOW_ALERT_DIALOG = 'SHOW_ALERT_DIALOG'
export const showAlertDialog = payload => ({
	type: SHOW_ALERT_DIALOG,
	payload
})

export const HIDE_ALERT_DIALOG = 'HIDE_ALERT_DIALOG'
export const hideAlertDialog = () => ({
	type: HIDE_ALERT_DIALOG
})
