import { DialogContent, Dialog } from '@components/ui/dialog'
import { orpcClient } from '@lib/orpc'
import type { ResultType } from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'
import ParticipantMap from '../ParticipantMap'
import ActivityMap from '../ActivityMap'

export default function MapDialog({ open, result, onClose }: { open: boolean; result: ResultType | undefined; onClose: () => void }) {
    const { data: fleet } = useQuery(orpcClient.fleet.find.queryOptions({ input: { fleetId: result?.fleetId || '' }, enabled: !!result }))

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-w-8/12'>
                {result?.trackableParticipantId ? (
                    <ParticipantMap participantId={result?.trackableParticipantId || ''} raceId={fleet?.raceId || ''} windowHeight={600} />
                ) : (
                    <ActivityMap raceId={fleet?.raceId || ''} windowHeight={600} activityId={result?.activityId || ''} />
                )}
            </DialogContent>
        </Dialog>
    )
}
