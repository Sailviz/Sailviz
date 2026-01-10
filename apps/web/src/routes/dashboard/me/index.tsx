import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return <div>Hello "/me/index"!</div>
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
