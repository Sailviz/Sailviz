'use client'
import { Button } from '@components/ui/button'
import { useSession } from '@sailviz/auth/client'

import { Link, useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '../PageSkeleton'

export default function HornTestButton() {
    const controller = new AbortController()
    const session = useLoaderData({ from: `__root__` })
    console.log('Session:', session)
    if (!session) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    const hornTest = async () => {
        fetch('https://' + session.club!.settings!.hornIP + '/hoot?startTime=100', {
            signal: controller.signal,
            headers: new Headers({ 'content-type': 'text/plain' })
        })
    }
    return (
        <Button
            onClick={hornTest}
            className='w-full cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
        >
            Horn Test
        </Button>
    )
}
