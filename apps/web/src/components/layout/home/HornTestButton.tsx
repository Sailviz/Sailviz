import { Button } from '@components/ui/button'

import { useLoaderData } from '@tanstack/react-router'
import { PageSkeleton } from '../PageSkeleton'
import { type Session } from '@sailviz/auth/client'
import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { ws_server } from '@components/URL'
import useWebSocket from '@hooks/use-ws'

export default function HornTestButton() {
    const session: Session = useLoaderData({ from: `__root__` })
    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())
    const { sendMessage } = useWebSocket(ws_server)

    console.log('Session:', session)
    if (!session || !org) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    const hornTest = async () => {
        //hoot
        console.log('sending hoot request')
        sendMessage(JSON.stringify({ type: 'hootRequest', orgId: org.id, duration: 200 }))
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
