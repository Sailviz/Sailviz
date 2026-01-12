import { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import HandicapPaperResultsTable from '@components/tables/HandicapPaperResultsTable'
import PursuitPaperResultsTable from '@components/tables/PursuitPaperResultsTable'
import dayjs from 'dayjs'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { FleetType, RaceType } from '@sailviz/types'

function Page() {
    const { raceId } = Route.useParams()
    const navigate = useNavigate()

    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data as RaceType

    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        onAfterPrint: () => {
            // navigate back to the dashboard after printing
            navigate({ to: '/dashboard/Race/' + raceId })
        }
    })

    useEffect(() => {
        if (race.id == raceId) {
            // give some time for the page to render
            setTimeout(() => {
                handlePrint()
            }, 500)
        }
    }, [race])

    return (
        <div className='h-full overflow-y-auto p-6' ref={contentRef}>
            {race!.fleets.map((fleet: FleetType, index: number) => {
                return (
                    <div key={'fleetResults' + index}>
                        <p className='text-2xl'>
                            {race.series!.name} - Race {race.number} ({dayjs(race.Time).format('DD/MM/YYYY HH:mm')}) - {fleet.fleetSettings.name}
                        </p>
                        {race.Type == 'Handicap' ? (
                            <HandicapPaperResultsTable fleet={fleet} />
                        ) : (
                            <PursuitPaperResultsTable {...race.fleets.flatMap(fleet => fleet.results!)} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export const Route = createFileRoute('/dashboard/PrintPaperResults/$raceId')({
    component: Page
})
