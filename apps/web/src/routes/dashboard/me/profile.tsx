import CreateSignOnProfileModal from '@components/layout/myRaces/CreateSignOnProfileModal'
import SignOnProfileTable from '@components/tables/SignOnProfileTable'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return (
        <div>
            <SignOnProfileTable />
            <CreateSignOnProfileModal />
        </div>
    )
}

export const Route = createFileRoute('/dashboard/me/profile')({
    component: Page
})
