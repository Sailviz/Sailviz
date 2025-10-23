import { signOut } from '@sailviz/auth/client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

function Page() {
    const navigate = useNavigate()
    signOut({
        fetchOptions: {
            onSuccess: () => {
                navigate({ to: '/' }) // redirect to lhome page after logout
            }
        }
    })

    return <p>Logging out...</p>
}

export const Route = createFileRoute('/Logout/')({
    component: Page
})
