import ReactDOM from 'react-dom/client'
import { RouterProvider, Router } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/queryClient'

import './index.css'

const router = new Router({
    routeTree,
    context: {
        queryClient
    }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
)
