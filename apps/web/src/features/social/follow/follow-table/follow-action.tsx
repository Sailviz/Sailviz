import { Button } from '@components/ui/button'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@lib/session'
import * as Types from '@sailviz/types'
import { useMutation } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'

interface CellActionProps {
    data: Types.ReducedUserType
}

export const FollowAction: React.FC<CellActionProps> = ({ data }) => {
    const session: Session = useLoaderData({ from: `__root__` })
    const userId = session.user.id

    const followUserMutation = useMutation(orpcClient.social.follow.create.mutationOptions())
    const follow = () => {
        console.log('follow', data)
        followUserMutation.mutate({ followerId: userId, followingId: data.id })
    }
    return (
        <>
            <Button className='cursor-pointer' onClick={follow}>
                Follow
            </Button>
        </>
    )
}
