import UserRacesTable from '@components/tables/UserRacesTable'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return (
        <div>
            <UserRacesTable viewHref='' />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/races')({
    component: Page
})
