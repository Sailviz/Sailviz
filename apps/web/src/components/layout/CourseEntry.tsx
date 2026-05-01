import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { queryClient } from '@lib/queryClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import EventMap from './EventMap'
import { Switch } from '@components/ui/switch'

export default function CourseEntry({ raceId }: { raceId: string }) {
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as Types.RaceType
    const buoys = useQuery(orpcClient.organization.buoys.session.queryOptions({})).data as Types.BuoyType[]
    console.log(buoys)

    const addBuoyMutation = useMutation(orpcClient.race.course.add.mutationOptions({}))
    const updateBuoyMutation = useMutation(orpcClient.race.course.update.mutationOptions({}))

    const addBuoy = () => {
        addBuoyMutation.mutate({ buoyId: buoys[0].id, order: buoys.length, side: 'port', raceId })
        queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
    }

    const updateBuoy = (courseBuoyId: string, buoy: Types.BuoyType, side: string, order: number) => {
        console.log(courseBuoyId, buoy, side, order)
        updateBuoyMutation.mutate({ id: courseBuoyId, buoy, side, order })
        queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
    }

    return (
        <div className='w-full border rounded-md p-4 flex flex-row'>
            <div className='flex items-center justify-between w-full mb-4'>
                <h2 className='text-xl font-bold'>Course</h2>
                {race.courseBuoys?.map(buoy => (
                    <div key={buoy.id} className='flex flex-col items-center space-x-2'>
                        <Select defaultValue={buoy.buoy.name} onValueChange={value => updateBuoy(buoy.id, buoys.find(b => b.name === value)!, buoy.side, buoy.order)}>
                            <SelectTrigger className='w-full max-w-48'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {buoys?.map(b => (
                                    <SelectItem key={b.id} value={b.name}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className='text-sm font-medium text-gray-700'>{buoy.side}</span>
                        <Switch
                            defaultChecked={buoy.side === 'starboard'}
                            className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
                            onCheckedChange={checked => updateBuoy(buoy.id, buoy.buoy, checked ? 'starboard' : 'port', buoy.order)}
                        />
                    </div>
                ))}
                <Button onClick={() => addBuoy()}>Add Buoy</Button>
            </div>
            <div className='w-1/3 justify-self-end'>
                <EventMap raceId={raceId} windowHeight={400} />
            </div>
        </div>
    )
}
