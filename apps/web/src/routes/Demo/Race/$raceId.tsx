import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import FleetHandicapResultsTable from '@components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@components/tables/FleetPursuitResultsTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import BackButton from '@components/layout/backButton'
import { Breadcrumbs } from '@components/breadcrumbs'
import { Button } from '@components/ui/button'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType } from '@sailviz/types'

export default function Page() {
    const navigate = useNavigate()

    const { raceId } = Route.useParams()

    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as RaceType

    const openRacePanel = async () => {
        if (race.Type == 'Handicap') {
            navigate({ to: '/HRace/' + race.id })
        } else {
            navigate({ to: '/PRace/' + race.id })
        }
    }

    const downloadResults = async () => {
        race.fleets.forEach(async fleet => {
            // by pointing the browser to the api endpoint, the browser will download the file
            window.location.assign(`/api/ExportFleetResults?id=${fleet.id}`)
        })
    }

    useEffect(() => {
        if (race != undefined) {
            console.log(race.Type)
        }
    }, [race])

    if (race == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <div className='bg-green-500 text-center p-3 font-bold grid grid-cols-3 justify-items-start text-xl'>
                <BackButton route={'/'} />
                <div className='my-auto text-center justify-self-stretch'>Demo Mode</div>
            </div>

            <div id='race' className='h-full w-full overflow-y-auto'>
                <div className='flex flex-wrap justify-center gap-4 w-full'>
                    <div className='flex flex-wrap px-4 divide-y divide-solid w-full justify-center'>
                        <div className='py-4 w-3/5'>
                            <Breadcrumbs />
                            <p className='text-2xl'>{race.Type} Race</p>
                            <p className='text-2xl'>{dayjs(race.Time).format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                        <div className='py-4 w-4/5'>
                            <div className='flex flex-wrap justify-center'>
                                <Button className='mx-1' onClick={() => openRacePanel()}>
                                    Race
                                </Button>
                                <Button className='mx-1'>Add Entry</Button>
                                <Button disabled className='mx-1'>
                                    Calculate
                                </Button>
                                <Link to={`/PrintPaperResults/${race.id}`}>
                                    <Button className='mx-1'>Print Race Sheet</Button>
                                </Link>

                                <Button className='mx-1' disabled>
                                    Upload Entries
                                </Button>
                                <Button onClick={downloadResults}>Download Results</Button>
                            </div>
                        </div>
                        <div className='py-4 w-full'>
                            {race.fleets.map((fleet, index) => {
                                return (
                                    <div key={'fleetResults' + index}>
                                        {race.Type == 'Handicap' ? (
                                            <FleetHandicapResultsTable showTime={true} editable={false} fleetId={fleet.id} />
                                        ) : (
                                            <FleetPursuitResultsTable editable={false} fleetId={fleet.id} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/Demo/Race/$raceId')({
    component: Page
})
