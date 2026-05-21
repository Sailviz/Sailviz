import { Button } from '@components/ui/button'
import { useRouter, useRouterState } from '@tanstack/react-router'
import * as Types from '@sailviz/types'

interface CellActionProps {
    data: Types.RaceType
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter()
    const routerState = useRouterState()

    const redirectPath = routerState.location.pathname.toLowerCase() == '/dashboard/race' ? `${data.id}` : `race/${data.id}`

    return (
        <>
            <Button className=' cursor-pointer' onClick={() => router.navigate({ to: redirectPath })}>
                Open
            </Button>
        </>
    )
}
