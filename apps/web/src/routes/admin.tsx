import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { MyRouterContext } from './__root'
import { ensureAdmin } from '../lib/session'

export const Route = createFileRoute('/admin')({
    component: () => <Outlet />,
    beforeLoad: async ({ context }) => {
        const { queryClient } = context as MyRouterContext
        const session = await ensureAdmin(queryClient)
        if (!session) {
            throw redirect({ to: '/Login' })
        }
    }
})
