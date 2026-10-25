import { Button } from '@components/ui/button'
import { useRouter, useRouterState } from '@tanstack/react-router'
import * as Types from '@sailviz/types'

interface OpenProps {
    data: Types.Activity
}

export const Open: React.FC<OpenProps> = ({ data }) => {
    const routerState = useRouterState()
    const router = useRouter()

    console.log(routerState.location.pathname.toLowerCase())
    const redirectPath = '/Dashboard/me/activity/' + data.id

    return (
        <>
            <Button className='cursor-pointer' onClick={() => router.navigate({ to: redirectPath })}>
                Open
            </Button>
        </>
    )
}
