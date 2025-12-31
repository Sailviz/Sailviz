import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/me/clubs')({
    component: RouteComponent
})

function RouteComponent() {
    return <div>Hello "/me/clubs"!</div>
}
