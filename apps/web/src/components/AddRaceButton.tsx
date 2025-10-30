import { useMutation } from '@tanstack/react-query'
import { Button } from './ui/button'
import { orpcClient } from '@lib/orpc'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    return (
        <Button
            variant={'blue'}
            onClick={async () => {
                await createRaceMutation.mutateAsync({ seriesId })
            }}
        >
            Add Race
        </Button>
    )
}
