'use client'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { useSession, signOut } from 'next-auth/react'

export default function BackButton({ demoMode = false }) {
    const Router = useRouter()
    const handleClick = async () => {
        Router.back()
    }
    return (
        <Button onClick={() => handleClick()} variant={'secondary'} className='w-24 h-8'>
            {' '}
            Back{' '}
        </Button>
    )
}
