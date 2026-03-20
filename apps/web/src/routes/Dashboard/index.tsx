import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
    beforeLoad: async ({ context }) => {
        const session = context?.auth
        console.log('Dashboard route beforeLoad, session:', session)
        if (!session) {
            throw redirect({ to: '/' })
        }

        console.log(session)
        if (session.session.activeOrganizationId === 'admin-id') {
            throw redirect({ to: '/admin' })
        } else {
            throw redirect({ to: '/dashboard/home' })
        }
    }
})
