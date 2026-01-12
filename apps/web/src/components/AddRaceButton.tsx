import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/button'
import { orpcClient } from '@lib/orpc'
import { client } from '@sailviz/auth/client'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    const createRaceMutation = useMutation(orpcClient.race.create.mutationOptions())
    const createEventMutation = useMutation(orpcClient.trackable.event.create.mutationOptions())
    const updateRaceMutation = useMutation(orpcClient.race.update.mutationOptions())
    const queryClient = useQueryClient()
    const { data: club } = client.useActiveOrganization()

    return (
        <Button
            variant={'blue'}
            onClick={async () => {
                console.log(club)
                const race = await createRaceMutation.mutateAsync({ seriesId })
                if (JSON.parse(club?.metadata).trackable.enabled || false) {
                    // create event in trackable
                    const event = await createEventMutation.mutateAsync({
                        orgId: JSON.parse(club!.metadata).trackable.orgId || '',
                        name: race.series?.name + ' - ' + race.number.toString()
                    })
                    await updateRaceMutation.mutateAsync({
                        ...race,
                        trackableEventId: event.id
                    })
                }
                await queryClient.invalidateQueries({
                    queryKey: orpcClient.series.find.key({ type: 'query', input: { seriesId } })
                })
            }}
        >
            Add Race
        </Button>
    )
}
