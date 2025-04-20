'use client'
import React, { act, ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { useDisclosure } from '@nextui-org/react'
import { title } from '@/components/ui/home/primitaves'
import ViewResultModal from '@/components/ui/dashboard/viewResultModal'
import { useSession, signIn } from 'next-auth/react'

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()
    const { race, raceIsError, raceIsValidating } = Fetcher.Race(params.slug, true)

    const viewModal = useDisclosure()

    var [activeResult, setActiveResult] = useState<ResultsDataType>()
    var [activeFleet, setActiveFleet] = useState<FleetDataType>()

    const openViewModal = (resultId: string) => {
        let result = race.fleets.flatMap(fleet => fleet.results).find(result => result.id == resultId)
        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        console.log(result)
        result.laps.sort((a, b) => a.time - b.time)
        setActiveResult(result)
        setActiveFleet(race.fleets.filter(fleet => fleet.id == result?.fleetId)[0]!)
        viewModal.onOpen()
    }

    if (clubIsValidating || raceIsValidating || session == undefined || club == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <ViewResultModal isOpen={viewModal.isOpen} result={activeResult} fleet={activeFleet} onClose={viewModal.onClose} />
            {race.fleets.map((fleet, index) => {
                return (
                    <div key={'fleetResults' + index} className='h-screen'>
                        <div className='p-6 h-1/6'>
                            <h1 className={title({ color: 'blue' })}>
                                Results - {race.series.name} - Race {race.number}
                            </h1>
                            <p className='py-4 text-2xl font-bold'>
                                {fleet?.fleetSettings.name} - Boats Entered: {fleet?.results.length}
                            </p>
                        </div>

                        <div className='p-6 h-5/6'>
                            {race.Type == 'Handicap' ? (
                                <FleetHandicapResultsTable
                                    showTime={true}
                                    editable={false}
                                    fleetId={fleet.id}
                                    startTime={fleet.startTime}
                                    key={JSON.stringify(race)}
                                    deleteResult={null}
                                    updateResult={null}
                                    raceId={race.id}
                                    showEditModal={null}
                                    showViewModal={openViewModal}
                                />
                            ) : (
                                <FleetPursuitResultsTable
                                    showTime={true}
                                    editable={false}
                                    fleetId={fleet.id}
                                    startTime={fleet.startTime}
                                    key={JSON.stringify(race)}
                                    deleteResult={null}
                                    updateResult={null}
                                    raceId={race.id}
                                    showEditModal={null}
                                />
                            )}
                        </div>
                    </div>
                )
            })}
        </>
    )
}
