'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()


    var [todaysRaces, setTodaysRaces] = useState<NextRaceDataType[]>([])

    const createEvent = async () => {
        //create a series
        let nameElement = document.getElementById("eventName") as HTMLInputElement
        let name = nameElement.value
        let numberOfRacesElement = document.getElementById("eventRaces") as HTMLInputElement
        let numberOfRaces = parseInt(numberOfRacesElement.value)
        if (name == "" || numberOfRaces < 1) {
            //show error saying data is invalid
            return
        }
        let series = await DB.createSeries(club.id, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(club.id, series.id)
        }
        hideCreateModal()
    }

    const showCreateModal = () => {
        const modal = document.getElementById("editModal")

        modal?.classList.remove("hidden")
    }

    const hideCreateModal = async () => {
        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }



    useEffect(() => {
        let timer1 = setTimeout(async () => {
            var data = await DB.getTodaysRaceByClubId(club.id)
            if (data) {
                setTodaysRaces(data)
            } else {
                console.log("could not find todays race")
            }
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [todaysRaces]);

    return (
        <>
            <div id="editModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={hideCreateModal}>&times;</div>
                    <div className="text-6xl font-extrabold text-gray-700 p-6">Create Event</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='hidden' id="EditResultId">

                            </p>
                            <p className='text-2xl font-bold text-gray-700'>
                                Name
                            </p>
                            <input type="text" id="eventName" className="h-full text-2xl p-4" />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Number of Races
                            </p>

                            <input type="number" id="eventRaces" className="h-full text-2xl p-4" />
                        </div>
                    </div>
                    <div className="flex flex-row justify-end">
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmEdit" onClick={createEvent} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                    Create
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full gap-6 flex flex-col">
                <p className="text-xl font-semibold">
                    This is still new software! Please write down finish Times!
                </p>
                {/* show all races that are happening today */}
                {todaysRaces.length > 0 ?
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6 mx-36">
                            Races Happening Today:
                        </p>
                        <div className="flex flex-row flex-wrap p-6 mx-36">
                            {todaysRaces.map((race, index) => {
                                return (
                                    <div className="m-6" key={race.id}>
                                        <div onClick={() => { Router.push('/Race/' + race.id) }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                            {race.series.name}: {race.number} at {race.Time.slice(11, 16)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    :
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6 mx-36"> No Races Today</p>
                    </div>
                }
                <div className="m-6">
                    <div onClick={showCreateModal} className="mx-36 cursor-pointer text-white bg-green-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center w-2/12">
                        Create New Event
                    </div>
                </div>
            </div>
        </>
    )
}