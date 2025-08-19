'use client'
import React, { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import BackButton from '@/components/layout/backButton'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PageProps = { params: Promise<{ slug: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()

    const { slug } = use(props.params)

    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(slug, true)

    const openRacePanel = async () => {
        if (race.Type == 'Handicap') {
            Router.push('/HRace/' + race.id)
        } else {
            Router.push('/PRace/' + race.id)
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
                <BackButton demoMode={true} />
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
                                <Link href={`/PrintPaperResults/${race.id}`}>
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
