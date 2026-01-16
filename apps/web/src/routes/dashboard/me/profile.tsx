import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return <div>Hello "/me/profile"!</div>
}

export const Route = createFileRoute('/dashboard/me/profile')({
    component: Page
})
