import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

function Page() {
    const session = useLoaderData({ from: `__root__` })

    const navigate = useNavigate()

    if (!session) {
        return navigate({ to: '/' })
    } else {
        if (session.user.admin) {
            return navigate({ to: '/admin' })
        } else {
            return navigate({ to: '/Dashboard' })
        }
    }
}

export const Route = createFileRoute('/authsorter/')({
    component: Page
})
