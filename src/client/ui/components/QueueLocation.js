import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { updateSystemStatus } from 'client/actions'
import './css/QueueLocation.css'

const mapStateToProps = state => ({
	location: state.system.location,
	isLoggedIn: state.user.isLoggedIn
})

const mapDispatchToProps = dispatch => ({
	updateSystemStatus: location => dispatch(updateSystemStatus(undefined, location))
})

class QueueLocation extends React.Component {
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
			<div className="queue-location text-center">
				{
					this.state.editing ? (
						<h3>Location:
							<div>
								<input name="location" type="text" onChange={this.handleInputChange} value={this.state.location}/>
								<button onClick={this.handleSave}>{this.state.input.length === 0 ? 'Cancel' : 'Save'}</button>
							</div>
						</h3>
					) : (
						<h3>Location:
							<div>
								{this.props.location || '-'}
								{
									this.props.isLoggedIn && (
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

QueueLocation.propTypes = {
	location: PropTypes.string.isRequired,
	isLoggedIn: PropTypes.bool.isRequired,
	updateSystemStatus: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueLocation)
