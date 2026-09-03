import { Button } from '@components/ui/button'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@lib/session'
import * as Types from '@sailviz/types'
import { useMutation } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'

interface CellActionProps {
    data: Types.ReducedUserType
}

export const UnfollowAction: React.FC<CellActionProps> = ({ data }) => {
    const session: Session = useLoaderData({ from: `__root__` })
    const userId = session.user.id

    const unfollowUserMutation = useMutation(orpcClient.social.follow.delete.mutationOptions())
    const unfollow = () => {
        console.log('follow', data)
        unfollowUserMutation.mutate({ followerId: userId, followingId: data.id })
    }
    return (
        <>
            <Button className='cursor-pointer' onClick={unfollow}>
                Unfollow
            </Button>
        </>
    )
}
