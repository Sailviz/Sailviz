import { createRouter, Outlet, RouterProvider, useRouterState } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import AppSidebar from '@components/layout/app-sidebar'
import { ScrollArea } from '@components/ui/scroll-area'
import { AdminNavCollections, navCollections } from 'src/constants/navCollections'
import Plausible from 'plausible-tracker'
import ErrorBoundary from '@components/ErrorBoundary'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { getSession } from '@sailviz/auth/client'
import Header from '@components/layout/header'

enum Sidebar {
    Dashboard,
    Admin,
    SignOn,
    None
}

export const plausible = Plausible({
    domain: 'sailviz.com',
    trackLocalhost: false
})

//this avoids type issues because the types are not up do date.
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element
}

// Create a top-level QueryClient for react-query hooks
const queryClient = new QueryClient()
export const Route = createRootRoute({
    loader: async () => {
        const { data: session } = await getSession()
        console.log('Session in root loader:', session)
        return session
    },
    staleTime: 1000 * 60, // 1 minute
    component: () => {
        const router = useRouterState()
        const path = router.location.pathname

        let sidebar: boolean = false
        let collection
        plausible.enableAutoPageviews()
        if (path.startsWith('/Dashboard')) {
            collection = navCollections
            sidebar = true
        } else if (path.startsWith('/admin')) {
            collection = AdminNavCollections
            sidebar = true
        }

        return (
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider attribute='class' defaultTheme='light'>
                        {sidebar ? (
                            <SidebarProvider defaultOpen={true}>
                                <AppSidebar navCollections={collection!} />
                                <SidebarInset>
                                    {/* page main content */}
                                    <Header />
                                    <ScrollArea className='h-full'>
                                        <div className='flex flex-1 p-4 md:px-6'>
                                            <Outlet />
                                        </div>
                                    </ScrollArea>
                                    {/* page main content ends */}
                                </SidebarInset>
                            </SidebarProvider>
                        ) : (
                            <Outlet />
                        )}
                    </ThemeProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        )
    }
})
