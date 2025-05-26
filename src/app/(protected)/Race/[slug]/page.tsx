'use client'
import React, { act, ChangeEvent, MouseEventHandler } from 'react'
import * as DB from '@/components/apiMethods'
import dayjs from 'dayjs'
import Papa from 'papaparse'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
// import CreateResultModal from '@/components/ui/dashboard/CreateResultModal'
// import ProgressModal from '@/components/ui/dashboard/ProgressModal'
// import EditResultModal from '@/components/ui/dashboard/EditResultModal'
// import { mutate } from 'swr'
// import ViewResultModal from '@/components/ui/dashboard/viewResultModal'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EntryFileUpload } from '@/components/EntryFileUpload'
import { useSession } from 'next-auth/react'
import * as Fetcher from '@/components/Fetchers'

type PageProps = { params: { slug: string } }

export default function Page(props: PageProps) {
    const params = props.params
    const { data: session, status } = useSession()

    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    //TODO implement timer on fetch
    // const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    // const createModal = useDisclosure()
    // const progressModal = useDisclosure()
    // const editModal = useDisclosure()
    // const viewModal = useDisclosure()

    const createResult = async (helm: string, crew: string, boat: BoatDataType, sailNum: string, fleetId: string) => {
        //create a result for each fleet
        let result = await DB.createResult(fleetId)
        await DB.updateResult({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum })

        console.log(helm, crew, boat, sailNum, fleetId)
        // createModal.onClose() //close modal

        // mutate('/api/GetFleetById?id=' + fleetId)
    }

    const updateResult = async (result: ResultsDataType) => {
        // editModal.onClose()
        await DB.updateResult(result)

        //mutate all incase fleet was changed
        race.fleets.forEach(fleet => {
            //     // mutate('/api/GetFleetById?id=' + fleet.id)
        })
        // mutateRace()
    }

    const deleteResult = async (result: ResultsDataType) => {
        await DB.DeleteResultById(result)
        // mutate('/api/GetFleetById?id=' + result.fleetId)
        console.log('deleted')
        // editModal.onClose()
    }

    const printRaceSheet = async () => {
        redirect('/PrintPaperResults/' + race.id)
    }

    //Capitalise the first letter of each word, and maintain cursor pos.
    const saveRaceSettings = (e: any) => {
        let newRaceData: RaceDataType = race
        const sentence = e.target.value.split(' ')
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        const calitalisedSentence = capitalizedWords.join(' ')

        newRaceData.Duties[e.target.id] = calitalisedSentence
        DB.updateRaceById(newRaceData)
        // mutate('/api/GetRaceById?id=' + race.id)

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }

    const openRacePanel = async () => {
        if (race.Type == 'Handicap') {
            redirect('/HRace/' + race.id)
        } else {
            redirect('/PRace/' + race.id)
        }
    }

    const showEditModal = async (resultId: string) => {
        let result = race.fleets.flatMap(fleet => fleet.results).find(result => result.id == resultId)
        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        console.log(result)
        result.laps.sort((a, b) => a.time - b.time)
        // setActiveResult(result)

        // setActiveFleet(race.fleets.filter(fleet => fleet.id == result?.fleetId)[0]!)

        // editModal.onOpen()
    }

    const showViewModal = async (resultId: string) => {
        let result = race.fleets.flatMap(fleet => fleet.results).find(result => result.id == resultId)
        if (result == undefined) {
            console.error('Could not find result with id: ' + resultId)
            return
        }
        console.log(result)
        result.laps.sort((a, b) => a.time - b.time)
        // setActiveResult(result)

        // setActiveFleet(race.fleets.filter(fleet => fleet.id == result?.fleetId)[0]!)

        // viewModal.onOpen()
    }

    const saveRaceType = async (newValue: any) => {
        console.log(newValue)

        await DB.updateRaceById({ ...race, Type: newValue.value })
        // mutate('/api/GetRaceById?id=' + race.id)
    }

    const copyFromPrevious = async () => {
        let today = await DB.getTodaysRaceByClubId(session?.user.clubId!)
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
        let previousRaceData = await DB.getRaceById(previousRace.id)
        //copy duties
        let newDuties = previousRaceData.Duties
        //update DB
        console.log(newDuties)
        await DB.updateRaceById({ ...race, Duties: newDuties })
        // mutateRace()
    }

    const downloadResults = async () => {
        race.fleets.forEach(async fleet => {
            // by pointing the browser to the api endpoint, the browser will download the file
            window.location.assign(`/api/ExportFleetResults?id=${fleet.id}`)
        })
    }

    // useEffect(() => {
    //     const fetchName = async () => {
    //         setSeriesName(await DB.GetSeriesById(race.seriesId).then(series => series.name))
    //     }
    //     if (race != undefined) {
    //         fetchName()
    //     }
    // }, [race])

    return (
        <div id='race' className='h-full w-full overflow-y-auto'>
            {/* <CreateResultModal isOpen={createModal.isOpen} race={race} boats={boats} onSubmit={createResult} onClose={createModal.onClose} /> */}
            {/* <ProgressModal
                key={progressValue}
                isOpen={progressModal.isOpen}
                Value={progressValue}
                Max={progressMax}
                Indeterminate={progressIndeterminate}
                onClose={progressModal.onClose}
            /> */}
            {/* <EditResultModal
                advancedEdit={userHasPermission(session.user, AVAILABLE_PERMISSIONS.advancedResultEdit)}
                isOpen={editModal.isOpen}
                fleet={activeFleet}
                raceType={race.Type}
                result={activeResult}
                onSubmit={updateResult}
                onDelete={deleteResult}
                onClose={editModal.onClose}
            /> */}
            {/* <ViewResultModal isOpen={viewModal.isOpen} result={activeResult} fleet={activeFleet} onClose={viewModal.onClose} /> */}
            <div className='flex flex-wrap justify-center gap-4 w-full'>
                <div className='flex flex-wrap px-4 divide-y divide-solid w-full justify-center'>
                    <div className='py-4 w-3/5'>
                        <Breadcrumbs />
                        <p className='text-2xl'>{race.Type} Race</p>
                        <p className='text-2xl'>{dayjs(race.Time).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <div className='py-4 w-3/5 justify-center'>
                        <p className='text-xl font-medium text-center'>Duty Team</p>
                        <div className='flex flex-wrap justify-stretch'>
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
                                                // onBlur={saveRaceSettings}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            <div className='w-1/4 mr-4 pb-4 pt-6'>
                                {/* <Button color='warning' onClick={copyFromPrevious}>
                                    Copy from previous race
                                </Button> */}
                            </div>
                        </div>
                    </div>
                    <div className='py-4 w-4/5'>
                        <div className='flex flex-wrap justify-center'>
                            <Link href={race.Type == 'Handicap' ? `/HRace/${race.id}` : `/PRace/${race.id}`}>
                                <Button className='mx-1' variant={'green'}>
                                    Race Mode
                                </Button>
                            </Link>
                            <Button className='mx-1'>Add Entry</Button>
                            <Button disabled className='mx-1'>
                                Calculate
                            </Button>
                            <Link href={`/PrintPaperResults/${race.id}`}>
                                <Button className='mx-1'>Print Race Sheet</Button>
                            </Link>
                            {userHasPermission(session!.user, AVAILABLE_PERMISSIONS.UploadEntires) ? <EntryFileUpload raceId={race.id} /> : <></>}
                            {/* {userHasPermission(session!.user, AVAILABLE_PERMISSIONS.DownloadResults) ? <Button onClick={downloadResults}>Download Results</Button> : <></>} */}
                        </div>
                    </div>
                    <div className='py-4 w-full'>
                        {race!.fleets.map((fleet, index) => {
                            return (
                                <div key={'fleetResults' + index}>
                                    {race.Type == 'Handicap' ? (
                                        <FleetHandicapResultsTable
                                            showTime={true}
                                            editable={userHasPermission(session!.user, AVAILABLE_PERMISSIONS.editResults)}
                                            fleetId={fleet.id}
                                            key={JSON.stringify(race)}
                                            raceId={race.id}
                                        />
                                    ) : (
                                        <FleetPursuitResultsTable
                                            showTime={true}
                                            editable={userHasPermission(session!.user, AVAILABLE_PERMISSIONS.editResults)}
                                            fleetId={fleet.id}
                                            key={JSON.stringify(race)}
                                            raceId={race.id}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
