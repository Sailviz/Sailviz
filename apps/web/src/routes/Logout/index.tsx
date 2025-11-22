import { signOut } from '@sailviz/auth/client'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sessionQueryKey } from 'src/lib/session'
import { isTauriRuntime } from '../../is-tauri'
import { api_server } from '@components/URL'

function Page() {
    const navigate = useNavigate()
    const router = useRouter()
    const queryClient = useQueryClient()
    useEffect(() => {
        const doLogout = async () => {
            const isTauri = isTauriRuntime()
            if (isTauri) {
                try {
                    // Try to remove token from Tauri store first
                    let token: string | null = null
                    try {
                        const { Store } = await eval('import("@tauri-apps/plugin-store")')
                        const store = new Store('sailviz-store.dat')
                        token = (await store.get('sailviz_token')) as string | null
                        await store.delete('sailviz_token')
                        await store.save()
                    } catch (e) {
                        // fallback to localStorage
                        try {
                            token = (window as any).localStorage
                                ?.getItem('sailviz_token')(window as any)
                                .localStorage?.removeItem('sailviz_token')
                        } catch {}
                    }

                    // Notify server to delete session by token if we have one
                    if (token) {
                        try {
                            await fetch(`${api_server}/api/auth/my-plugin/session-by-token`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            })
                        } catch (e) {}
                    }
                } catch (e) {
                    console.warn('Tauri logout failed:', e)
                }

                // Clear client cache and redirect
                try {
                    queryClient.removeQueries({ queryKey: sessionQueryKey as any })
                } catch {}
                try {
                    await router.invalidate()
                } catch {}
                navigate({ to: '/' })
                return
            }

            // Web cookie-based logout
            signOut({
                fetchOptions: {
                    onSuccess: async () => {
                        // Clear session cache and invalidate routes
                        try {
                            queryClient.removeQueries({ queryKey: sessionQueryKey as any })
                        } catch {}
                        try {
                            await router.invalidate()
                        } catch {}
                        navigate({ to: '/' }) // redirect to home page after logout
                    }
                }
            })
        }

        doLogout()
    }, [])

    return <p>Logging out...</p>
}

export const Route = createFileRoute('/Logout/')({
    component: Page
})
