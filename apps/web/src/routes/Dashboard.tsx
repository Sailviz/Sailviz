import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { MyRouterContext } from './__root'
import { ensureSession } from '../lib/session'

export const Route = createFileRoute('/Dashboard')({
    component: () => <Outlet />,
    beforeLoad: async ({ context }) => {
        const { queryClient } = context as MyRouterContext
        const session = await ensureSession(queryClient)
        if (!session) {
            throw redirect({ to: '/Login' })
        }
    }
})
