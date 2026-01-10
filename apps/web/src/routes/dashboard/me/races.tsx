import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return <div>Hello "/me/races"!</div>
}

export const Route = createFileRoute('/dashboard/me/races')({
    component: Page
})
