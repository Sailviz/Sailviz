import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { queryClient } from '@lib/queryClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import EventMap from './EventMap'
import { Switch } from '@components/ui/switch'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import type { Session } from '@lib/session'
import { useLoaderData } from '@tanstack/react-router'

export default function CourseEntry({ raceId }: { raceId: string }) {
    const session: Session = useLoaderData({ from: `__root__` })

    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as Types.RaceType
    const buoys = useQuery(orpcClient.organization.buoys.session.queryOptions({})).data as Types.BuoyType[]
    const [courseBuoys, setCourseBuoys] = useState<Types.CourseBuoyType[]>([])

    // Initialize local state when race data is fetched
    useEffect(() => {
        if (race?.courseBuoys) {
            setCourseBuoys(race.courseBuoys)
        }
    }, [race])

    const addBuoyMutation = useMutation(orpcClient.race.course.add.mutationOptions())
    const updateBuoyMutation = useMutation(orpcClient.race.course.update.mutationOptions())
    const deleteBuoyMutation = useMutation(orpcClient.race.course.delete.mutationOptions())
    const getTodayRace = useMutation(orpcClient.race.today.mutationOptions())
    const getRace = useMutation(orpcClient.race.find.mutationOptions())

    const updateEventWaypoints = useMutation(orpcClient.trackable.waypoint.setEvent.mutationOptions())

    const addBuoy = () => {
        const newBuoy = { buoyId: buoys[0].id, order: courseBuoys.length, side: 'port', raceId }
        addBuoyMutation.mutate(newBuoy, {
            onSuccess: () => {
                setCourseBuoys(prev => [...prev, { ...newBuoy, id: `temp-${Date.now()}`, buoy: buoys[0] }])
                queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
            }
        })
    }

    const removeBuoy = () => {
        const lastBuoy = courseBuoys.slice(-1)[0]
        if (!lastBuoy) return
        deleteBuoyMutation.mutate(
            { courseBuoyId: lastBuoy.id },
            {
                onSuccess: () => {
                    setCourseBuoys(prev => prev.slice(0, -1))
                    queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
                }
            }
        )
    }

    const updateBuoy = (courseBuoyId: string, buoy: Types.BuoyType, side: string, order: number) => {
        updateBuoyMutation.mutate(
            { id: courseBuoyId, buoy, side, order },
            {
                onSuccess: () => {
                    setCourseBuoys(prev => prev.map(b => (b.id === courseBuoyId ? { ...b, buoy, side, order } : b)))
                    queryClient.invalidateQueries(orpcClient.race.find.queryOptions({ input: { raceId } }))
                    console.log('Buoy added, updating event waypoints...')
                    const inner = buoys.find(b => b.name == 'INNER')
                    const outer = buoys.find(b => b.name == 'OUTER')
                    if (!inner || !outer) {
                        alert('INNER or OUTER buoy not found, cannot update waypoints')
                        return
                    }
                    const startLine = { order: 0, name: 'Start Line', lat: inner.lat, lon: inner.lon, blat: outer.lat, blon: outer.lon }
                    updateEventWaypoints.mutate({
                        eventId: race.trackableEventId!,
                        waypoints: [
                            startLine,
                            ...courseBuoys
                                // Update the changed buoy in the waypoints list as state does not update immediately
                                .map(b => (b.id === courseBuoyId ? { ...b, buoy, side, order } : b))
                                .map(cb => ({ order: cb.order + 1, name: cb.buoy.name, lat: cb.buoy.lat, lon: cb.buoy.lon }))
                        ]
                    })
                }
            }
        )
    }

    const copyFromPreviousRace = async () => {
        let today = await getTodayRace.mutateAsync({ orgId: session.session.activeOrganizationId! })
        if (today == undefined) {
            alert('unable to get previous data')
            return
        }
        //sort by time, oldest first
        today.sort((a, b) => dayjs(a.Time).unix() - dayjs(b.Time).unix())
        console.log(today)
        //get index of current race
        let index = today.findIndex(tod => {
            return tod.id == race.id
        })
        console.log(index)
        // select race before current
        let previousRace = today[index - 1]
        if (previousRace == undefined) {
            alert('No previous race found')
            return
        }

        //we have a course to copy, so remove any existing course in this race
        race.courseBuoys?.forEach(buoy => {
            deleteBuoyMutation.mutate({ courseBuoyId: buoy.id })
        })
        let previousRaceData = (await getRace.mutateAsync({ raceId: previousRace.id })) as Types.RaceType
        //copy duties
        let newCourseBuoys = previousRaceData.courseBuoys
        //update DB
        if (newCourseBuoys == undefined) {
            alert('No course found in previous race')
            return
        }
        await Promise.all(
            newCourseBuoys.map(buoy => {
                return addBuoyMutation.mutateAsync({ buoyId: buoy.buoy.id, order: buoy.order, side: buoy.side, raceId })
            })
        )
        queryClient.invalidateQueries({
            queryKey: orpcClient.race.find.key({ type: 'query' })
        })
    }

    return (
        <div className='w-full border rounded-md p-4 flex flex-row'>
            <div className='flex items-center justify-between w-full mb-4'>
                <h2 className='text-xl font-bold'>Course</h2>
                {courseBuoys?.map(buoy => (
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
                <div className='flex flex-col m-2'>
                    <Button variant='green' className='m-2' onClick={() => addBuoy()}>
                        Add Buoy
                    </Button>
                    <Button className='m-2' onClick={() => copyFromPreviousRace()}>
                        Copy From Previous Race
                    </Button>
                    <Button className='m-2' onClick={() => removeBuoy()}>
                        Remove Last Buoy
                    </Button>
                    <Button disabled variant='warning' className='m-2'>
                        Update Moveable Buoy Positions
                    </Button>
                </div>
            </div>
            <div className='w-1/3 justify-self-end'>
                <EventMap raceId={raceId} windowHeight={400} />
            </div>
        </div>
    )
}
