import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import AppSidebar from '@components/layout/app-sidebar'
import { ScrollArea } from '@components/ui/scroll-area'
import { AdminNavCollections, navCollections } from 'src/constants/navCollections'
import Plausible from 'plausible-tracker'
import ErrorBoundary from '@components/ErrorBoundary'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { getSession } from '@sailviz/auth/client'
import Header from '@components/layout/header'

export interface MyRouterContext {
    // Optional auth object; not required at router creation time
    auth?: any
    // Shared React Query client instance for use in loaders/beforeLoad
    queryClient: QueryClient
}

export const plausible = Plausible({
    domain: 'sailviz.com',
    trackLocalhost: false
})

//this avoids type issues because the types are not up do date.
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element
}

// Use the shared QueryClient provided at the app root
import { queryClient } from 'src/lib/queryClient'
export const Route = createRootRouteWithContext<MyRouterContext>()({
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
