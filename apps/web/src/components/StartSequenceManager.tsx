import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
const StartSequenceManager = ({ initialSequence, seriesId }: { initialSequence: string; seriesId: string }) => {
    const seriesUpdate = useMutation(orpcClient.series.update.mutationOptions())

    const updateSequence = async (newSequence: string) => {
        await seriesUpdate.mutateAsync({
            id: seriesId,
            startSequence: newSequence
        })
    }
    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>Start Sequence</h2>

            <Tabs defaultValue={initialSequence} onValueChange={updateSequence}>
                <TabsList>
                    <TabsTrigger value='541go'>5 4 1 GO</TabsTrigger>
                    <TabsTrigger value='321go'>3 2 1 GO</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}

export default StartSequenceManager
