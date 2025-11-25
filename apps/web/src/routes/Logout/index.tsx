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
                        // Try a couple of store filenames used historically
                        const storeNames = ['sailviz-store.dat', 'sailviz-store']
                        for (const name of storeNames) {
                            try {
                                const store = new Store(name)
                                const found = (await store.get('sailviz_token')) as string | null
                                if (found) token = found
                                try {
                                    await store.delete('sailviz_token')
                                } catch {}
                                try {
                                    await store.save()
                                } catch {}
                            } catch (inner) {
                                // ignore per-store errors and try next
                            }
                        }
                    } catch (e) {
                        // fallback to localStorage
                        try {
                            token = window?.localStorage?.getItem('sailviz_token') ?? null
                            window?.localStorage?.removeItem('sailviz_token')
                        } catch (e) {
                            console.warn('localStorage token cleanup failed', e)
                        }
                    }

                    // As a safety, also remove any lingering localStorage key
                    try {
                        window?.localStorage?.removeItem('sailviz_token')
                    } catch {}

                    // Notify server to delete session by token if we have one
                    if (token) {
                        try {
                            console.debug('Logout: deleting token on server', token)
                            // Try to send token both in header and query param to ensure
                            // it reaches the server in environments where headers
                            // may be filtered.
                            const resp = await fetch(`${api_server}/api/auth/my-plugin/session-by-token?token=${encodeURIComponent(token)}`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            })
                            if (!resp.ok) {
                                console.warn('Server token delete responded non-ok', resp.status)
                            } else {
                                console.debug('Server token delete OK')
                            }
                        } catch (e) {
                            console.warn('Failed to notify server to delete token', e)
                        }
                    } else {
                        console.debug('Logout: no token found in store/localStorage')
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
