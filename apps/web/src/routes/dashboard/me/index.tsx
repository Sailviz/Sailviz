import PersonalRacesTable from '@components/tables/PersonalRacesTable'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return <div>Home</div>
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
