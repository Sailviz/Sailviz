import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'

interface CellActionProps {
    data: Types.ReducedUserType
}

export const RemoveFollowerAction: React.FC<CellActionProps> = ({ data }) => {
    data = data
    return (
        <>
            <Button className=' cursor-pointer'>Remove Follower</Button>
        </>
    )
}
