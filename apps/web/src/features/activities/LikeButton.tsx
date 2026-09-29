import { Button } from '@components/ui/button'
import { orpcClient } from '@lib/orpc'
import { useMutation } from '@tanstack/react-query'

export const LikeButton = ({ activityId }: { activityId: string }) => {
    const createLikeMutation = useMutation(orpcClient.activity.like.create.mutationOptions())

    const handleLike = async () => {
        createLikeMutation.mutateAsync({
            activityId
        })
    }
    return (
        <Button variant='secondary' size='sm' className='mt-1' onClick={handleLike}>
            Bravo
        </Button>
    )
}
