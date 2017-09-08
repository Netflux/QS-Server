import React from 'react'
import { Switch, Route } from 'react-router'

import { NavBar, Footer } from './components'
import { HomePage, AboutPage, NotFoundPage } from './pages'
import './index.css'

const App = () => (
	<div id="content">
		<NavBar/>

		<Switch>
			<Route exact path="/" component={HomePage}/>
			<Route exact path="/about" component={AboutPage}/>
			<Route component={NotFoundPage}/>
		</Switch>

		<Footer/>
	</div>
)

export default App
