import SignOnLayout from '@components/layout/SignOn/layout'
import SignOnView from '@components/layout/SignOn/SignOnView'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return (
        <SignOnLayout>
            <SignOnView />
        </SignOnLayout>
    )
}
export const Route = createFileRoute('/SignOn/')({
    component: Page
})
