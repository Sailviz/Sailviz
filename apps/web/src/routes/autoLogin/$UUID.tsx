import { useEffect } from 'react'
import { client } from '@sailviz/auth/client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

function Page() {
    const { UUID } = Route.useParams()

    const navigate = useNavigate()

    const sendLoginRequest = async (uuid: string) => {
        // @ts-ignore not sure why this is needed, but it is
        const res = await client.myPlugin.authByUuid({ uuid, fetchOptions: { method: 'POST' } })
        console.log(res)
        navigate({ to: res.data.user.startPage || '/' })
    }

    useEffect(() => {
        console.log(UUID)
        if (UUID != undefined) {
            sendLoginRequest(UUID)
        }
    }, [])

    return (
        <div className='container mx-auto flex flex-col items-center justify-center h-screen p-4'>
            <h1 className='text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700'>Logging in</h1>
            <a className='ml-4' href='#' onClick={() => navigate({ to: '/' })}>
                or Cancel
            </a>
        </div>
    )
}

export const Route = createFileRoute('/autoLogin/$UUID')({
    component: Page
})
