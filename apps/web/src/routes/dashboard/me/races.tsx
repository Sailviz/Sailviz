import PageContainer from '@components/layout/page-container'
import UserRacesTable from '@components/tables/UserRacesTable'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return (
        <PageContainer scrollable={true}>
            <UserRacesTable />
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/races')({
    component: Page
})
