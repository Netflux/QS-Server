import React from 'react'
import PropTypes from 'prop-types'

import './css/LoadRipple.css'

const LoadRipple = ({ size }) => {
	let style = {}

	if (size) {
		style.margin = `${-((200 - size) / 2)}px auto`
		style.transform = `scale(${size / 200})`
	}

	return (
		<div className="lds-ripple" style={style}>
			<div></div>
			<div></div>
		</div>
	)
}

LoadRipple.propTypes = {
	size: PropTypes.number
}

export default LoadRipple
