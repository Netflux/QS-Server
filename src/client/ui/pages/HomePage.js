import React from 'react'

import { QueueLocation, QueueRemaining, TicketDisplay, TicketTools, TicketTable } from 'client/ui/components'

const HomePage = () => (
	<main>
		<TicketDisplay/>
		<QueueLocation/>
		<QueueRemaining/>
		<TicketTools/>
		<TicketTable/>
	</main>
)

export default HomePage
