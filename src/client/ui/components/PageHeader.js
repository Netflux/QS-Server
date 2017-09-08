import React from 'react'
import PropTypes from 'prop-types'

import './css/PageHeader.css'

const PageHeader = ({ title }) => (
	<header className="pageheader">
		<h1>{title}</h1>
	</header>
)

PageHeader.propTypes = {
	title: PropTypes.string.isRequired
}

export default PageHeader
