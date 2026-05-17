import { Button } from '@components/ui/button'
import { useRouter } from '@tanstack/react-router'
import * as Types from '@sailviz/types'

interface CellActionProps {
    data: Types.SeriesType
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter()

    return (
        <>
            <Button className=' cursor-pointer' onClick={() => router.navigate({ to: `/Dashboard/series/${data.id}` })}>
                Open
            </Button>
        </>
    )
}
