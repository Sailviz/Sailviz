import { Button } from '@components/ui/button'
import { useRouter, useRouterState } from '@tanstack/react-router'
import * as Types from '@sailviz/types'

interface CellActionProps {
    data: Types.SeriesType
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const routerState = useRouterState()
    const router = useRouter()

    console.log(routerState.location.pathname.toLowerCase())
    const redirectPath = routerState.location.pathname.toLowerCase() == '/dashboard/series' ? `${data.id}` : `series/${data.id}`

    return (
        <>
            <Button className=' cursor-pointer' onClick={() => router.navigate({ to: redirectPath })}>
                Open
            </Button>
        </>
    )
}
