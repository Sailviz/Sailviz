import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button'
import { orpcClient } from '@lib/orpc'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    const queryClient = useQueryClient()

    return (
        <Button
            variant={'blue'}
            onClick={async () => {
                await createRaceMutation.mutateAsync({ seriesId })
                await queryClient.invalidateQueries({
                    queryKey: orpcClient.series.find.key({ type: 'query', input: { seriesId } })
                })
            }}
        >
            Add Race
        </Button>
    )
}
