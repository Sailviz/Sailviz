import { BravoIcon } from '@components/icons/bravo-icon'
import { Button } from '@components/ui/button'
import { orpcClient } from '@lib/orpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const LikeButton = ({ activityId, id }: { activityId: string; id: string | undefined }) => {
    const queryClient = useQueryClient()
    const createLikeMutation = useMutation(orpcClient.activity.like.create.mutationOptions())
    const deleteLikeMutation = useMutation(orpcClient.activity.like.delete.mutationOptions())

    const handleLike = async () => {
        console.log(
            queryClient
                .getQueryCache()
                .getAll()
                .map(q => q.queryKey)
        )
        await createLikeMutation.mutateAsync({
            activityId
        })
        await queryClient.invalidateQueries({ queryKey: orpcClient.user.feed.get.key() })
    }

    const handleUnlike = async () => {
        console.log(
            queryClient
                .getQueryCache()
                .getAll()
                .map(q => q.queryKey)
        )
        await deleteLikeMutation.mutateAsync({
            id: id as string
        })
        await queryClient.invalidateQueries({ queryKey: orpcClient.user.feed.get.key() })
    }

    if (id !== undefined) {
        return (
            <Button variant='default' size='sm' className='mt-1' onClick={handleUnlike}>
                <BravoIcon colour='#ff0000' />
            </Button>
        )
    }
    return (
        <Button variant='default' size='sm' className='mt-1' onClick={handleLike}>
            <BravoIcon colour='#333333' />
        </Button>
    )
}
