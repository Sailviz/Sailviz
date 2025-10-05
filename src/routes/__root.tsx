import { Outlet } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'

const RootComponent = () => (
    <div>
        <Outlet />
    </div>
)

export const Route = createRootRoute({
    component: RootComponent
})
