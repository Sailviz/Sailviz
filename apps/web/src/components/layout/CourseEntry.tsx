import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { queryClient } from '@lib/queryClient'

export default function CourseEntry({ raceId }: { raceId: string }) {
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as Types.RaceType
    const bouys = useQuery(orpcClient.organization.bouys.session.queryOptions({})).data as Types.BuoyType[]

    const addBouyMutation = useMutation(orpcClient.race.course.add.mutationOptions({}))
    console.log(race)

    const addBouy = () => {
        addBouyMutation.mutate({ bouyId: bouys[0].id, order: bouys.length, side: 'port', raceId })
        queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
    }

    return (
        <div className='w-full border rounded-md p-4'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold'>Course</h2>
                {race.courseBouys?.map(bouy => (
                    <div key={bouy.id} className='flex items-center space-x-2'>
                        <div className={`w-4 h-4 rounded-full ${bouy.buoy.isStartLine ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span>{bouy.buoy.name}</span>
                    </div>
                ))}
                <Button onClick={() => addBouy()}>Add Bouy</Button>
            </div>
        </div>
    )
}
