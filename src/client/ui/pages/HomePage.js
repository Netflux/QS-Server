import React from 'react'

import { QueueLocation, TicketDisplay, TicketTools, TicketTable } from 'client/ui/components'

const HomePage = () => (
	<main>
		<TicketDisplay/>
		<QueueLocation/>
		<TicketTools/>
		<TicketTable/>
	</main>
)

export default HomePage
