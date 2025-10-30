import { signOut } from '@sailviz/auth/client'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sessionQueryKey } from 'src/lib/session'

function Page() {
    const navigate = useNavigate()
    const router = useRouter()
    const queryClient = useQueryClient()
    useEffect(() => {
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
    }, [])

    return <p>Logging out...</p>
}

export const Route = createFileRoute('/Logout/')({
    component: Page
})
