import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import AppSidebar from '@components/layout/app-sidebar'
import { ScrollArea } from '@components/ui/scroll-area'
import { AdminNavCollections, meCollections, navCollections } from 'src/constants/navCollections'
import ErrorBoundary from '@components/ErrorBoundary'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { getSession } from '@sailviz/auth/client'
import Header from '@components/layout/header'
import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

export interface MyRouterContext {
    // Optional auth object; not required at router creation time
    auth?: any
    // Shared React Query client instance for use in loaders/beforeLoad
    queryClient: QueryClient
}

//this avoids type issues because the types are not up do date.
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element
}

// Use the shared QueryClient provided at the app root
import { queryClient } from 'src/lib/queryClient'
export const Route = createRootRouteWithContext<MyRouterContext>()({
    beforeLoad: async () => {
        try {
            const { data: session } = await getSession()
            console.log('Session in root beforeLoad:', session)
            return {
                auth: session
            }
        } catch (e) {
            console.error('Root beforeLoad getSession failed:', e)
            // Gracefully degrade: return null session so UI can still render
            return {
                auth: null
            }
        }
    },
    loader: async () => {
        try {
            const { data: session } = await getSession()
            console.log('Session in root loader:', session)
            return session
        } catch (e) {
            console.error('Root loader getSession failed:', e)
            // Gracefully degrade: return null session so UI can still render
            return null
        }
    },
    staleTime: 1000 * 60, // 1 minute
    errorComponent: ({ error }) => {
        // TanStack Router data/load errors fallback
        return (
            <div className='p-6 space-y-4'>
                <h1 className='text-xl font-bold'>An error occurred</h1>
                <p className='text-red-600 break-all'>{String(error)}</p>
                <p className='text-sm text-muted-foreground'>
                    If this is a network error on Android, ensure ports are forwarded (adb reverse) or BASE_URL points to your host machine.
                </p>
            </div>
        )
    },
    component: () => {
        const router = useRouterState()
        const path = router.location.pathname

        // F11 fullscreen toggle for Tauri
        useEffect(() => {
            const isTauri = '__TAURI_INTERNALS__' in window
            console.log('Setting up F11 fullscreen toggle. Is Tauri:', isTauri)

            const handleKeyDown = async (e: KeyboardEvent) => {
                if (e.key === 'F11' || e.code === 'F11') {
                    console.log('F11 detected!')
                    e.preventDefault()
                    e.stopPropagation()

                    if (isTauri) {
                        try {
                            console.log('Toggling fullscreen via Tauri invoke...')
                            await invoke('toggle_fullscreen')
                            console.log('Fullscreen toggled successfully')
                        } catch (error) {
                            console.error('Error toggling fullscreen:', error)
                        }
                    } else {
                        console.log('Not in Tauri environment')
                    }
                }
            }

            document.addEventListener('keydown', handleKeyDown, { capture: true })
            console.log('F11 event listener attached')

            return () => {
                document.removeEventListener('keydown', handleKeyDown, { capture: true })
            }
        }, [])

        let sidebar: boolean = false
        let collection
        if (path.startsWith('/dashboard/me')) {
            collection = meCollections
            sidebar = true
        } else if (path.startsWith('/dashboard')) {
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
