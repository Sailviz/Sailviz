import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import dayjs from 'dayjs';
import Select from 'react-select';

import Dashboard from "../components/Dashboard";

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

    var [clubId, setClubId] = useState<string>("invalid")

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            pursuitLength: 0,
            hornIP: "",
            clockOffset: 0,
        },
        series: [],
        boats: [],
    })

    var [user, setUser] = useState<UserDataType>({
        id: "",
        displayName: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })


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
        let series = await DB.createSeries(clubId, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(clubId, series.id)
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
        setClubId(Cookies.get('clubId') || "")

    }, [router])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }

            const fetchClub = async () => {
                var data = await DB.GetClubById(clubId)
                if (data) {
                    setClub(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchClub()

            const fetchUser = async () => {
                var userid = Cookies.get('userId')
                if (userid == undefined) return
                var data = await DB.GetUserById(userid)
                if (data) {
                    setUser(data)
                    if (data.permLvl == 2) {
                        router.push('/SignOn')
                    }
                    if (data.permLvl == 0) {
                        router.push('/AdminDashboard')
                    }
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()


            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                if (data) {
                    setTodaysRaces(data)
                } else {
                    console.log("could not find todays race")
                }
            }
            fetchTodaysRaces()

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])


    useEffect(() => {
        let timer1 = setTimeout(async () => {
            var data = await DB.getTodaysRaceByClubId(clubId)
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
        <Dashboard club={club.name} displayName={user.displayName}>
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
            <div className="flex flex-col w-full">
                <p className="text-6xl font-extrabold text-gray-700 p-6 mx-36">
                    This is still new software! Please write down finish Times!
                </p>
                <div onClick={() => { router.push({ pathname: '/RaceOfficerGuide' }) }} className="cursor-pointer w-2/12 mx-36 text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                    Race Officer Guide
                </div>
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
                                        <div onClick={() => { router.push({ pathname: '/Race', query: { race: race.id } }) }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
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
        </Dashboard>
    )
}

export default SignOnPage