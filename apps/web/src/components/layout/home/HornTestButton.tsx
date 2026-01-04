import { Button } from '@components/ui/button'

import { useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '../PageSkeleton'
import { client, type Session } from '@sailviz/auth/client'

export default function HornTestButton() {
    const controller = new AbortController()
    const session: Session = useLoaderData({ from: `__root__` })
    const { data: org } = client.useActiveOrganization()

    console.log('Session:', session)
    if (!session || !org) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    const hornTest = async () => {
        fetch('https://' + org.metadata.settings.hornIP + '/hoot?startTime=100', {
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
