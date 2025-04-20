'use client'
import React, { act, ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import dayjs from 'dayjs'
import Papa from 'papaparse'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { BreadcrumbItem, Breadcrumbs, Button, Input, Radio, RadioGroup, Switch, useDisclosure } from '@nextui-org/react'
import BackButton from '@/components/ui/backButton'
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
    const { GlobalConfig, GlobalConfigIsError, GlobalConfigIsValidating } = Fetcher.UseGlobalConfig()

    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    const [raceType, setRaceType] = useState('handicap')

    const [seriesName, setSeriesName] = useState('')

    const openRacePanel = async () => {
        if (race.Type == 'handicap') {
            Router.push('/HRace/' + race.id)
        } else {
            Router.push('/PRace/' + race.id)
        }
    }

    const createNewRace = async (requestedType: string) => {
        let newRace = await DB.createRace(GlobalConfig.demoClubId, GlobalConfig.demoSeriesId)
        newRace = await DB.getRaceById(newRace.id, true)
        //load demo data into the new race
        const demoData = await DB.getRaceById(GlobalConfig.demoDataId, true)
        console.log(newRace)
        //update race data
        await DB.updateRaceById({ ...demoData, id: newRace.id, Type: requestedType, seriesId: GlobalConfig.demoSeriesId })
        //add results data
        await Promise.all(
            demoData.fleets
                .flatMap(fleet => fleet.results)
                .map(result => {
                    return DB.createResult(newRace.fleets[0]!.id).then(newResult => {
                        DB.updateResult({ ...newResult, Helm: result.Helm, Crew: result.Crew, boat: result.boat })
                    })
                })
        )
        params.slug = newRace.id
        setRaceType(requestedType)
        window.history.replaceState(null, '', `/Demo/Race/${newRace.id}`)
        // mutate('/api/GetFleetById?id=' + newRace.fleets[0]!.id)
    }

    useEffect(() => {
        const fetchName = async () => {
            setSeriesName('Demo Series')
        }
        if (race != undefined) {
            fetchName()
        }
        if (race != undefined) {
            console.log(race.Type)
            setRaceType(race.Type)
        }
    }, [race])

    if (clubIsValidating || club == undefined || boats == undefined || race == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <div className='bg-green-500 text-center p-3 font-bold grid grid-cols-3 justify-items-start text-xl'>
                <BackButton demoMode={true} />
                <div className='my-auto text-center justify-self-stretch'>Demo Mode</div>
                <RadioGroup className='my-auto justify-self-start' orientation='horizontal' onValueChange={createNewRace} value={raceType} size='lg'>
                    <Radio value='handicap'>Handicap</Radio>
                    <Radio value='pursuit'>Pursuit</Radio>
                </RadioGroup>
            </div>

            <div id='race' className='h-full w-full overflow-y-auto'>
                {/* <CreateResultModal isOpen={createModal.isOpen} race={race} boats={boats} onSubmit={createResult} onClose={createModal.onClose} /> */}
                {/* <ProgressModal key={progressValue} isOpen={progressModal.isOpen} Value={progressValue} Max={progressMax} Indeterminate={progressIndeterminate} onClose={progressModal.onClose} /> */}
                {/* <EditResultModal isOpen={editModal.isOpen} fleet={activeFleet} result={activeResult} onSubmit={updateResult} onDelete={deleteResult} onClose={editModal.onClose} /> */}
                {/* <ViewResultModal isOpen={viewModal.isOpen} result={activeResult} fleet={activeFleet} onClose={viewModal.onClose} /> */}
                <div className='flex flex-wrap justify-center gap-4 w-full'>
                    <div className='flex flex-wrap px-4 divide-y divide-solid w-full justify-center'>
                        <div className='py-4 w-3/5'>
                            <Breadcrumbs>
                                <BreadcrumbItem>{seriesName}</BreadcrumbItem>
                                <BreadcrumbItem>Race {race.number} </BreadcrumbItem>
                            </Breadcrumbs>
                            <p className='text-2xl'>{race.Type} Race</p>
                            <p className='text-2xl'>{dayjs(race.Time).format('DD/MM/YYYY HH:mm')}</p>
                        </div>
                        <div className='py-4 w-3/5 justify-center'>
                            <p className='text-xl font-medium text-center'>Duty Team</p>
                            <div className='flex flex-wrap justify-stretch' key={JSON.stringify(race.Duties)}>
                                {Object.entries(race.Duties).map(([displayName, name], index) => {
                                    return (
                                        <div key={'duty' + index} className='flex-col w-1/3 pr-4'>
                                            <div className='flex items-center py-4'>
                                                <label htmlFor={displayName} className='block mb-2 font-medium text-gray-900 dark:text-white w-1/2'>
                                                    {displayName}
                                                </label>
                                                <Input
                                                    type='text'
                                                    id={displayName}
                                                    defaultValue={name as unknown as string} //seems to be a bug, so explicitly cast
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                <div className='w-1/4 mr-4 pb-4 pt-6'>
                                    <Button color='warning'>Copy from previous race</Button>
                                </div>
                            </div>
                        </div>
                        <div className='py-4 w-4/5'>
                            <div className='flex flex-wrap justify-center'>
                                <Button className='mx-1' onClick={() => openRacePanel()}>
                                    Race
                                </Button>
                                <Button className='mx-1'>Add Entry</Button>
                                <Button isDisabled className='mx-1'>
                                    Calculate
                                </Button>
                                <Button className='mx-1'>Print Race Sheet</Button>

                                <Button className='mx-1'>Upload Entries</Button>
                                <Input id='entryFileUpload' type='file' accept='.csv' className='hidden' />
                                <Button>Download Results</Button>
                            </div>
                        </div>
                        <div className='py-4 w-full'>
                            {race.fleets.map((fleet, index) => {
                                return (
                                    <div key={'fleetResults' + index}>
                                        {race.Type == 'handicap' ? (
                                            <FleetHandicapResultsTable
                                                showTime={true}
                                                editable={false}
                                                fleetId={fleet.id}
                                                key={JSON.stringify(race)}
                                                deleteResult={null}
                                                updateResult={null}
                                                raceId={race.id}
                                                showEditModal={null}
                                                showViewModal={null}
                                            />
                                        ) : (
                                            <FleetPursuitResultsTable
                                                showTime={true}
                                                editable={false}
                                                fleetId={fleet.id}
                                                key={JSON.stringify(race)}
                                                deleteResult={null}
                                                updateResult={null}
                                                raceId={race.id}
                                                showEditModal={null}
                                                showViewModal={null}
                                            />
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
