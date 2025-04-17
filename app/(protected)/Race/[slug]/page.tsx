'use client'
import React, { act, ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from 'components/apiMethods'
import dayjs from 'dayjs'
import Papa from 'papaparse'
import FleetHandicapResultsTable from 'components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from 'components/tables/FleetPursuitResultsTable'
import * as Fetcher from 'components/Fetchers'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users'
import { PageSkeleton } from 'components/ui/PageSkeleton'
import { BreadcrumbItem, Breadcrumbs, Button, Input, useDisclosure } from '@nextui-org/react'
import CreateResultModal from 'components/ui/dashboard/CreateResultModal'
import ProgressModal from 'components/ui/dashboard/ProgressModal'
import EditResultModal from 'components/ui/dashboard/EditResultModal'
import { mutate } from 'swr'
import ViewResultModal from 'components/ui/dashboard/viewResultModal'
import { json } from 'stream/consumers'

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter()

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    //TODO implement timer on fetch
    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(params.slug, true)

    const [seriesName, setSeriesName] = useState('')

    const createModal = useDisclosure()
    const progressModal = useDisclosure()
    const editModal = useDisclosure()
    const viewModal = useDisclosure()

    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [progressIndeterminate, setProgressIndeterminate] = useState(false)

    var [activeResult, setActiveResult] = useState<ResultsDataType>()
    var [activeFleet, setActiveFleet] = useState<FleetDataType>()

    const createResult = async (helm: string, crew: string, boat: BoatDataType, sailNum: string, fleetId: string) => {
        //create a result for each fleet
        let result = await DB.createResult(fleetId)
        await DB.updateResult({ ...result, Helm: helm, Crew: crew, boat: boat, SailNumber: sailNum })

        console.log(helm, crew, boat, sailNum, fleetId)
        createModal.onClose() //close modal

        mutate('/api/GetFleetById?id=' + fleetId)
    }

    const updateResult = async (result: ResultsDataType) => {
        editModal.onClose()
        await DB.updateResult(result)

        //mutate all incase fleet was changed
        race.fleets.forEach(fleet => {
            mutate('/api/GetFleetById?id=' + fleet.id)
        })
        mutateRace()
    }

    const deleteResult = async (result: ResultsDataType) => {
        await DB.DeleteResultById(result)
        mutate('/api/GetFleetById?id=' + result.fleetId)
        console.log('deleted')
        editModal.onClose()
    }

    const printRaceSheet = async () => {
        Router.push('/PrintPaperResults/' + race.id)
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
        mutate('/api/GetRaceById?id=' + race.id)

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }

    const openRacePanel = async () => {
        if (race.Type == 'Handicap') {
            Router.push('/HRace/' + race.id)
        } else {
            Router.push('/PRace/' + race.id)
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
        setActiveResult(result)

        setActiveFleet(race.fleets.filter(fleet => fleet.id == result?.fleetId)[0]!)

        editModal.onOpen()
    }

    const showViewModal = async (resultId: string) => {
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

    const saveRaceType = async (newValue: any) => {
        console.log(newValue)

        await DB.updateRaceById({ ...race, Type: newValue.value })
        mutate('/api/GetRaceById?id=' + race.id)
    }

    const copyFromPrevious = async () => {
        let today = await DB.getTodaysRaceByClubId(club.id)
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
        mutateRace()
    }

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        progressModal.onOpen()
        setProgressIndeterminate(true)
        setProgressValue(0)
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results: any) {
                console.log(results)
                setProgressIndeterminate(false)
                setProgressMax(results.data.length)
                let index = 0
                for (const line of results.data) {
                    setProgressValue(++index)
                    //check if all fields are present
                    if (line.Helm == undefined || line.Crew == undefined || line.Boat == undefined || line.SailNumber == undefined) {
                        alert('missing fields')
                        progressModal.onClose()
                        return
                    }
                    let result: ResultsDataType = {} as ResultsDataType
                    if (line.Fleet == undefined) {
                        if (race.fleets.length > 1) {
                            alert("fleets aren't defined and there is more than one fleet in race")
                            return
                        } else {
                            result = await DB.createResult(race.fleets[0]!.id)
                        }
                    } else {
                        //fleet is defined
                        result = await DB.createResult(race.fleets.find(fleet => fleet.fleetSettings.name == line.Fleet)!.id)
                    }
                    result.Helm = line.Helm
                    result.Crew = line.Crew
                    result.SailNumber = line.SailNumber
                    const boatName = line.Boat
                    let boat = boats.find(boat => boat.name.toUpperCase() == boatName.toUpperCase())
                    if (boat == undefined) {
                        console.error('Boat ' + boatName + ' not found')
                    } else {
                        result.boat = boat
                    }
                    console.log(result)
                    //update with info
                    await DB.updateResult(result)
                }
                mutate('/api/GetRaceById?id=' + race.id)
                race.fleets.forEach(fleet => {
                    mutate('/api/GetFleetById?id=' + fleet.id)
                })
                progressModal.onClose()
            }
        })
    }

    const downloadResults = async () => {
        race.fleets.forEach(async fleet => {
            // by pointing the browser to the api endpoint, the browser will download the file
            window.location.assign(`/api/ExportFleetResults?id=${fleet.id}`)
        })
    }

    useEffect(() => {
        const fetchName = async () => {
            setSeriesName(await DB.GetSeriesById(race.seriesId).then(series => series.name))
        }
        if (race != undefined) {
            fetchName()
        }
    }, [race])

    if (user == undefined || club == undefined || boats == undefined || race == undefined) {
        return <PageSkeleton />
    }

    return (
        <div id='race' className='h-full w-full overflow-y-auto'>
            <CreateResultModal isOpen={createModal.isOpen} race={race} boats={boats} onSubmit={createResult} onClose={createModal.onClose} />
            <ProgressModal
                key={progressValue}
                isOpen={progressModal.isOpen}
                Value={progressValue}
                Max={progressMax}
                Indeterminate={progressIndeterminate}
                onClose={progressModal.onClose}
            />
            <EditResultModal
                advancedEdit={userHasPermission(user, AVAILABLE_PERMISSIONS.advancedResultEdit)}
                isOpen={editModal.isOpen}
                fleet={activeFleet}
                raceType={race.Type}
                result={activeResult}
                onSubmit={updateResult}
                onDelete={deleteResult}
                onClose={editModal.onClose}
            />
            <ViewResultModal isOpen={viewModal.isOpen} result={activeResult} fleet={activeFleet} onClose={viewModal.onClose} />
            <div className='flex flex-wrap justify-center gap-4 w-full'>
                <div className='flex flex-wrap px-4 divide-y divide-solid w-full justify-center'>
                    <div className='py-4 w-3/5'>
                        <Breadcrumbs>
                            <BreadcrumbItem onClick={() => Router.push('/Series/' + race.seriesId)}>{seriesName}</BreadcrumbItem>
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
                                                onBlur={saveRaceSettings}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            <div className='w-1/4 mr-4 pb-4 pt-6'>
                                <Button color='warning' onClick={copyFromPrevious}>
                                    Copy from previous race
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className='py-4 w-4/5'>
                        <div className='flex flex-wrap justify-center'>
                            <Button className='mx-1' onClick={() => openRacePanel()} color='success'>
                                Race Mode
                            </Button>
                            <Button className='mx-1' onClick={createModal.onOpen}>
                                Add Entry
                            </Button>
                            <Button isDisabled className='mx-1'>
                                Calculate
                            </Button>
                            <Button className='mx-1' onClick={() => printRaceSheet()}>
                                Print Race Sheet
                            </Button>
                            {userHasPermission(user, AVAILABLE_PERMISSIONS.UploadEntires) ? (
                                <>
                                    <Button className='mx-1' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                                        Upload Entries
                                    </Button>
                                    <Input id='entryFileUpload' type='file' accept='.csv' onChange={e => entryFileUploadHandler(e)} className='hidden' />
                                </>
                            ) : (
                                <></>
                            )}
                            {userHasPermission(user, AVAILABLE_PERMISSIONS.DownloadResults) ? <Button onClick={downloadResults}>Download Results</Button> : <></>}
                        </div>
                    </div>
                    <div className='py-4 w-full'>
                        {race.fleets.map((fleet, index) => {
                            return (
                                <div key={'fleetResults' + index}>
                                    {race.Type == 'Handicap' ? (
                                        <FleetHandicapResultsTable
                                            showTime={true}
                                            editable={userHasPermission(user, AVAILABLE_PERMISSIONS.editResults)}
                                            fleetId={fleet.id}
                                            key={JSON.stringify(race)}
                                            deleteResult={deleteResult}
                                            updateResult={updateResult}
                                            raceId={race.id}
                                            showEditModal={showEditModal}
                                            showViewModal={showViewModal}
                                        />
                                    ) : (
                                        <FleetPursuitResultsTable
                                            showTime={true}
                                            editable={userHasPermission(user, AVAILABLE_PERMISSIONS.editResults)}
                                            fleetId={fleet.id}
                                            key={JSON.stringify(race)}
                                            deleteResult={deleteResult}
                                            updateResult={updateResult}
                                            raceId={race.id}
                                            showEditModal={showEditModal}
                                            showViewModal={showViewModal}
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
