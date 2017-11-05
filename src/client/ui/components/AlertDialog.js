import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { hideAlertDialog } from 'client/actions'
import './css/AlertDialog.css'

const mapStateToProps = state => ({
	alertDialog: state.ui.alertDialog
})

const mapDispatchToProps = dispatch => ({
	hideAlertDialog: () => dispatch(hideAlertDialog())
})

const AlertDialog = ({ alertDialog, hideAlertDialog }) => {
	const handleButton = action => {
		if (action) { action() }
		hideAlertDialog()
	}
	return (
		<div className={`alert-dialog-bg ${alertDialog.isShowing ? 'visible' : ''}`}>
			<div className="alert-dialog">
				<div className="grid">
					<div className="col-12 title">
						<h2>{alertDialog.title}</h2>
					</div>

					<div className="col-12 content">
						<p>{alertDialog.description}</p>
					</div>

					<div className="col-12 grid-right actions">
						<button onClick={() => handleButton(alertDialog.cancelAction)}>CANCEL</button>
						<button onClick={() => handleButton(alertDialog.okAction)}>OK</button>
					</div>
				</div>
			</div>
		</div>
	)
}

AlertDialog.propTypes = {
	alertDialog: PropTypes.object.isRequired,
	hideAlertDialog: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertDialog)
