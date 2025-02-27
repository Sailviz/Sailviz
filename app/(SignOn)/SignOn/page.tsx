'use client'
import { useState } from 'react'
import * as DB from 'components/apiMethods'
import SignOnTable from 'components/tables/SignOnTable'
import * as Fetcher from 'components/Fetchers'
import { PageSkeleton } from 'components/ui/PageSkeleton'
import { Button, useDisclosure } from '@nextui-org/react'
import CreateResultModal from 'components/ui/SignOn/CreateResultModal'
import EditResultModal from 'components/ui/SignOn/EditResultModal'
import { mutate } from 'swr'

const SignOnPage = () => {
    const createModal = useDisclosure()
    const editModal = useDisclosure()

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()
    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(club)

    const [activeResult, setActiveResult] = useState<ResultsDataType>()

    const createResult = async (fleetId: string, helm: string, crew: string, boat: BoatDataType, sailNum: string) => {
        createModal.onClose()
        let entry = await DB.createResult(fleetId)

        entry.Helm = helm
        entry.Crew = crew
        entry.boat = boat
        entry.SailNumber = sailNum

        //then update it with the info
        await DB.updateResult(entry)

        //force a refresh of the data
        todaysRaces.forEach(race => {
            mutate('/api/GetRaceById?id=' + race.id + '&results=true')
        })
    }

    const updateResult = async (result: ResultsDataType) => {
        await DB.updateResult(result)
        editModal.onClose()

        //force a refresh of the data
        todaysRaces.forEach(race => {
            mutate('/api/GetRaceById?id=' + race.id + '&results=true')
        })
    }

    const deleteResult = async (result: ResultsDataType) => {
        if (!confirm('Are you sure you want to delete this entry')) return
        editModal.onClose()
        await DB.DeleteResultById(result)

        //force a refresh of the data
        todaysRaces.forEach(race => {
            mutate('/api/GetRaceById?id=' + race.id + '&results=true')
        })
    }

    const showEditModal = async (result: ResultsDataType) => {
        setActiveResult(result)
        editModal.onOpen()
    }

    if (todaysRaces == undefined) {
        return <PageSkeleton />
    }

    return (
        <div>
            <CreateResultModal isOpen={createModal.isOpen} todaysRaces={todaysRaces} boats={boats} onSubmit={createResult} onClose={createModal.onClose} />
            <EditResultModal
                isOpen={editModal.isOpen}
                raceId={activeResult ? activeResult.raceId : ''}
                result={activeResult}
                boats={boats}
                onSubmit={updateResult}
                onDelete={deleteResult}
                onClose={editModal.onClose}
            />

            {todaysRaces.length > 0 ? (
                <div className='w-full'>
                    <div className='overflow-x-scroll whitespace-nowrap relative'>
                        {todaysRaces.map((race, index) => {
                            console.log(race)
                            return (
                                <div className='m-6 inline-block' key={race.id}>
                                    <div className='text-4xl font-extrabol p-6'>
                                        {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                    </div>
                                    <SignOnTable raceId={race.id} updateResult={updateResult} createResult={createResult} clubId={club.id} showEditModal={showEditModal} />
                                </div>
                            )
                        })}
                    </div>
                    <div className='mx-4 my-3 text-center'>
                        <Button onClick={createModal.onOpen} color='success' fullWidth size='lg' aria-label='add entry'>
                            Add Entry
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className='text-6xl font-extrabol p-6'> No Races Today</p>
                </div>
            )}
        </div>
    )
}

export default SignOnPage
