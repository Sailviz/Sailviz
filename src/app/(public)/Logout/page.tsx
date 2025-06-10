'use client'
import { getSession, signOut } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

export default function LogoutPage() {
    signOut({
        fetchOptions: {
            onSuccess: () => {
                redirect('/') // redirect to lhome page after logout
            }
        }
    })

    return <p>Logging out...</p>
}
