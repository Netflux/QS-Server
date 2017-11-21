import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { updateSystemStatus } from 'client/actions'
import './css/QueueRemaining.css'

const mapStateToProps = state => ({
	system: state.system,
	isLoggedIn: state.user.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
	updateSystemStatus: remaining => dispatch(updateSystemStatus(undefined, undefined, remaining))
})

class QueueRemaining extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			editing: false,
			input: ''
		}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleSave = this.handleSave.bind(this)
	}

	handleInputChange(e) {
		this.setState({ input: e.target.value })
	}

	handleSave() {
		if (this.state.input) {
			this.props.updateSystemStatus(this.state.input)
		}
		this.setState({ editing: false, input: '' })
	}

	render() {
		return (
			<div className="queue-remaining text-center">
				{
					this.state.editing && !this.props.system.isEnabled ? (
						<h3>Remaining Tickets:
							<div>
								<input name="remaining" type="number" onChange={this.handleInputChange} value={this.state.remaining}/>
								<button onClick={this.handleSave}>{this.state.input.length === 0 ? 'Cancel' : 'Save'}</button>
							</div>
						</h3>
					) : (
						<h3>Remaining Tickets:
							<div>
								{this.props.system.remaining}
								{
									this.props.isLoggedIn && !this.props.system.isEnabled && (
										<button onClick={() => this.setState({ editing: true })}>Edit</button>
									)
								}
							</div>
						</h3>
					)
				}
			</div>
		)
	}
}

QueueRemaining.propTypes = {
	system: PropTypes.object.isRequired,
	isLoggedIn: PropTypes.bool.isRequired,
	updateSystemStatus: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueRemaining)
