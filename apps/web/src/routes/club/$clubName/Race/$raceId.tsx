import { createFileRoute } from '@tanstack/react-router'
import FleetHandicapResultsTable from '@components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@components/tables/FleetPursuitResultsTable'
import { title } from '@components/layout/home/primitaves'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import HomeNav from '@components/layout/home/navbar'

function Page() {
    const { raceId } = Route.useParams()

    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data

    // list of current series
    //list of

    return (
        <>
            <HomeNav />
            <div className='py-4 w-full'>
                <div className='py-4'>
                    <div className={title({ color: 'blue' })}>{race?.series?.name}</div>
                </div>
                {race?.fleets!.map((fleet, index) => {
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
        </>
    )
}

export const Route = createFileRoute('/club/$clubName/Race/$raceId')({
    component: Page
})
