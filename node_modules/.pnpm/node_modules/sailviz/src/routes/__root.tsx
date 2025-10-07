import { Outlet } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a top-level QueryClient for react-query hooks
const queryClient = new QueryClient()

const RootComponent = () => (
    <QueryClientProvider client={queryClient}>
        <div>
            <Outlet />
        </div>
    </QueryClientProvider>
)

export const Route = createRootRoute({
    component: RootComponent
})
