import { createFileRoute } from '@tanstack/react-router'
import FleetHandicapResultsTable from '@components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@components/tables/FleetPursuitResultsTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { title } from '@components/layout/home/primitaves'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ClubType, RaceType } from '@sailviz/types'

function Page() {
    const { raceId } = Route.useParams()

    const club = useQuery(orpcClient.club.session.queryOptions()).data as ClubType
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId } })).data as RaceType

    if (club == undefined || race == undefined || club == undefined) {
        return <PageSkeleton />
    }
    return (
        <div className='flex flex-col'>
            <h1 className={title({ color: 'blue' })}>
                Results - {race.series!.name} - Race {race.number}
            </h1>
            <div className='flex flex-row'>
                {race.fleets.map((fleet, index) => {
                    return (
                        <div key={'fleetResults' + index} className='h-screen'>
                            <div className='p-6 h-5/6'>
                                {race.Type == 'Handicap' ? (
                                    <FleetHandicapResultsTable showTime={true} editable={false} fleetId={fleet.id} advancedEdit={false} />
                                ) : (
                                    <FleetPursuitResultsTable editable={false} advancedEdit={false} fleetId={fleet.id} />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export const Route = createFileRoute('/SignOn/Race/$raceId')({
    component: Page
})
