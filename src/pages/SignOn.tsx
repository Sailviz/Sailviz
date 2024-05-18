import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import SignOnTable from "../components/SignOnTable";
import Select from 'react-select';
import FleetResultsTable from "../components/FleetResultsTable";
import Switch from "../components/Switch";


const SignOnPage = () => {

    const router = useRouter()

    const query = router.query

    var [clubId, setClubId] = useState<string>("invalid")

    var [user, setUser] = useState<UserDataType>({
        id: "",
        displayName: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    var [races, setRaces] = useState<RaceDataType[]>([])

    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        results: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })

    var [fleets, setFleets] = useState<FleetDataType[]>([])

    const [options, setOptions] = useState([{ label: "", value: {} }])

    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} })

    const [selectedRaces, setSelectedRaces] = useState<boolean[]>([]);

    const showPage = (id: string) => {
        //hide all pages.
        var Signon = document.getElementById('Signon')
        Signon?.classList.add('hidden')
        var results = document.getElementById('Results')
        results?.classList.add('hidden')
        var guide = document.getElementById('Guide')
        guide?.classList.add('hidden')

        let selected = document.getElementById(id)
        selected?.classList.remove('hidden')
    }

    const createResult = async (raceId: string) => {
        const HelmElement = document.getElementById("Helm") as HTMLInputElement
        const CrewElement = document.getElementById("Crew") as HTMLInputElement
        const SailNumberElement = document.getElementById("SailNum") as HTMLInputElement
        const Boat = selectedOption.value as BoatDataType
        //create a result record with fleet that matches series id
        let entry = await DB.createResult(raceId, fleets.filter(fleet => fleet.seriesId == races.filter(race => race.id == raceId)[0]!.seriesId)[0]!.id)

        entry.Helm = HelmElement.value
        entry.Crew = CrewElement.value
        entry.boat = Boat
        entry.SailNumber = SailNumberElement.value

        //then update it with the info
        await DB.updateResult(entry)
        //update local state
        let racesCopy = window.structuredClone(races)
        console.log(racesCopy)
        for (let i = 0; i < racesCopy.length; i++) {
            console.log(racesCopy[i]!.id)
            racesCopy[i] = await DB.getRaceById(racesCopy[i]!.id)
        }
        setRaces([...racesCopy])
        return true

    }

    const createResults = async () => {
        //check all necessary fields are filled
        const HelmElement = document.getElementById("Helm") as HTMLInputElement
        const SailNumberElement = document.getElementById("SailNum") as HTMLInputElement
        const Boat = selectedOption.value as BoatDataType

        if (HelmElement.value == "" || SailNumberElement.value == "") {
            console.log("Helm or Sail Number not entered")
            return
        }
        if (Object.keys(Boat).length == 0) {
            console.log("boat not selected")
            return
        }
        //check that at least one race is selected
        if (selectedRaces.every((e) => { return !e })) {
            console.log("no races selected")
            return
        }
        races.forEach(race => {
            let raceToggle = document.getElementById(race.id + "Switch") as HTMLInputElement
            if (raceToggle.checked) {
                createResult(race.id)
            }
        })
        hideAddBoatModal()
    }

    const updateResult = async () => {
        const resultid = document.getElementById("EditResultId") as HTMLInputElement
        let id = resultid.innerHTML

        let result = {} as ResultsDataType
        for (let race of races) {
            let index = race.results.findIndex((rac) => {
                return rac.id == id
            })
            console.log(index, race)
            if (index != -1) {
                result = race.results[index]
                console.log(result)
                break
            }
        }
        console.log(result)

        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        result.Helm = Helm.value

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        result.Crew = Crew.value

        setSelectedOption({ value: result.boat, label: result.boat.name })

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        result.SailNumber = sailNum.value

        await DB.updateResult(result)

        hideEditBoatModal()
    }

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const calitalisedSentence = capitalizedWords.join(' ')

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }


    const deleteResult = async (resultId?: string) => {
        console.log(resultId)
        if (resultId == undefined) {
            let temp = document.getElementById("EditResultId") as HTMLInputElement
            resultId = temp.innerHTML
        }
        await DB.DeleteResultById(resultId)

        let racesCopy = window.structuredClone(races)
        console.log(racesCopy)
        for (let i = 0; i < racesCopy.length; i++) {
            console.log(racesCopy[i]!.id)
            racesCopy[i] = await DB.getRaceById(racesCopy[i]!.id)
        }
        setRaces([...racesCopy])
    }

    const showEditModal = async (id: string) => {
        console.log(id)
        let result = {} as ResultsDataType
        for (let race of races) {
            let index = race.results.findIndex((rac) => {
                return rac.id == id
            })
            console.log(index, race)
            if (index != -1) {
                result = race.results[index]
                console.log(result)
                break
            }
        }
        console.log(result)
        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        Helm.value = result.Helm

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        Crew.value = result.Crew

        const Boat = document.getElementById("editClass") as HTMLSelectElement
        setSelectedOption({ value: result.boat, label: result.boat.name })

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        sailNum.value = result.SailNumber

        const resultid = document.getElementById("EditResultId") as HTMLInputElement
        resultid.innerHTML = result.id


        const modal = document.getElementById("editModal")
        modal?.classList.remove("hidden")
    }

    const GetFleetsBySeries = (seriesId: string) => {
        return fleets.filter((fleet) => {
            return fleet.seriesId == seriesId
        })
    }

    const hideEditBoatModal = async () => {
        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }

    const logout = async () => {
        if (confirm("Are you sure you want to log out") == true) {
            Cookies.remove('token')
            Cookies.remove('clubId')
            Router.push('/')
        }
    }

    const showAddBoatModal = async () => {
        const Helm = document.getElementById('Helm') as HTMLInputElement;
        Helm.value = ""

        const Crew = document.getElementById("Crew") as HTMLInputElement
        Crew.value = ""

        const sailNum = document.getElementById("SailNum") as HTMLInputElement
        sailNum.value = ""

        const raceSelects = document.getElementsByName("raceSelect")
        raceSelects.forEach((select) => {
            const inputSelect = select as HTMLInputElement
            inputSelect.checked = false
        })

        setSelectedOption({ label: "", value: {} })


        const modal = document.getElementById("addModal")
        modal?.classList.remove("hidden")

    }

    const hideAddBoatModal = async () => {
        const modal = document.getElementById("addModal")
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

            const fetchUser = async () => {
                var userid = Cookies.get('userId')
                if (userid == undefined) return
                var data = await DB.GetUserById(userid)
                if (data) {
                    setUser(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()

            const fetchBoats = async () => {
                var data = await DB.getBoats(clubId)
                if (data) {
                    let array = [...data]
                    setBoatData(array)
                    let tempoptions: { label: string; value: {} }[] = []
                    array.forEach(boat => {
                        tempoptions.push({ value: boat, label: boat.name })
                    })
                    setOptions(tempoptions)
                } else {
                    console.log("could not find boats")
                }

            }
            fetchBoats()

            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                console.log(data)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    let fleetsCopy: FleetDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        console.log(data[i]!.number)
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                        //add fleets to list if fleets are enabled for series.
                        const fleets = await DB.GetFleetsBySeries(res.seriesId)
                        if (fleets) {
                            fleetsCopy = fleetsCopy.concat(fleets)
                        }
                    }
                    setRaces(racesCopy)

                    //remove duplicates from fleets
                    let uniqueFleets = fleetsCopy.filter((fleet, index, self) =>
                        index === self.findIndex((t) => (
                            t.id === fleet.id
                        ))
                    )
                    setFleets(uniqueFleets)
                    setSelectedRaces(new Array(data.length).fill(false))
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
            console.log("updating local copy of results")
            let racesCopy = window.structuredClone(races)
            for (let i = 0; i < racesCopy.length; i++) {
                var data = await DB.getRaceById(racesCopy[i]!.id)
                racesCopy[i] = data
            }
            setRaces(racesCopy)
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [races]);

    return (
        <div>
            <div className="flex w-full flex-row justify-start">

                <p onClick={() => showPage("Signon")} className=" w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                    Sign On Sheet
                </p>
                <p onClick={() => showPage("Guide")} className=" w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                    Guide
                </p>
                <p onClick={() => logout()} className="ml-auto w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                    logout
                </p>
            </div>
            <div className="flex w-full shrink flex-row justify-around">
                {races.map((race, index) => {
                    return (
                        <p key={index} onClick={() => { setActiveRaceData(races[index]!); showPage("Results") }} className="w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            {race.series.name}: {race.number} Results
                        </p>
                    )
                })}
            </div>
            <div id="Signon" className="">
                <div id="addModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                    <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={hideAddBoatModal}>&times;</div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">Add Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Helm
                                </p>
                                <input type="text" id="Helm" name="Helm" className="h-full text-2xl p-4" onChange={CapitaliseInput} placeholder="J Bloggs" />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Crew
                                </p>

                                <input type="text" id="Crew" className="h-full text-2xl p-4" onChange={CapitaliseInput} />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Class
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="Class"
                                        className=' w-56 h-full text-3xl'
                                        options={options}
                                        value={selectedOption}
                                        onChange={(choice) => setSelectedOption(choice!)}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Sail Number
                                </p>

                                <input type="text" id="SailNum" className="h-full text-2xl p-4" />
                            </div>
                        </div>
                        <div className="text-4xl font-extrabold text-gray-700 p-6">Select Race</div>
                        {races.map((race, index) => {
                            return (
                                <div className="mx-6 mb-10" key={race.id}>
                                    <div className="flex flex-row">
                                        <Switch
                                            id={race.id + "Switch"}
                                            isOn={selectedRaces[index]!}
                                            onColour="#02c66f"
                                            handleToggle={() => { setSelectedRaces([...selectedRaces.slice(0, index), !selectedRaces[index], ...selectedRaces.slice(index + 1)]) }}
                                        />
                                        <label className=" pl-6 py-auto text-2xl font-bold text-gray-700" htmlFor={race.id}>{race.series.name} {race.number}</label>
                                        {/* show buttons for each fleet in a series */}
                                        {GetFleetsBySeries(race.seriesId).map((fleet: FleetDataType, index) => {
                                            return (
                                                <div key={fleet.id + race.id} className="ml-6 cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                                    {fleet.name}
                                                </div>
                                            )
                                        })}

                                    </div>
                                </div>
                            )
                        })}
                        <div className=" flex justify-end mt-8">
                            <div className="p-6 w-1/4 mr-2">
                                <p id="confirmEntry" onClick={createResults} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Add
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="editModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                    <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                        <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={hideEditBoatModal}>&times;</div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">Edit Entry</div>
                        <div className="flex w-3/4">
                            <div className='flex flex-col px-6 w-full'>
                                <p className='hidden' id="EditResultId">

                                </p>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Helm
                                </p>
                                <input type="text" id="editHelm" name="Helm" className="h-full text-2xl p-4" onChange={CapitaliseInput} />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Crew
                                </p>

                                <input type="text" id="editCrew" className="h-full text-2xl p-4" onChange={CapitaliseInput} />
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Class
                                </p>
                                <div className="w-full p-2 mx-0 my-2">
                                    <Select
                                        id="editClass"
                                        className=' w-56 h-full text-3xl'
                                        options={options}
                                        value={selectedOption}
                                        onChange={(choice) => setSelectedOption(choice!)}
                                    />
                                </div>
                            </div>
                            <div className='flex flex-col px-6 w-full'>
                                <p className='text-2xl font-bold text-gray-700'>
                                    Sail Number
                                </p>

                                <input type="text" id="editSailNum" className="h-full text-2xl p-4" />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end">
                            <div className=" flex justify-end mt-8">
                                <div className="p-4 mr-2">
                                    <p id="confirmRemove" onClick={() => { if (confirm("Are you sure you want to Delete?")) { deleteResult(undefined); hideEditBoatModal() } }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                        Remove
                                    </p>
                                </div>
                            </div>
                            <div className=" flex justify-end mt-8">
                                <div className="p-4 mr-2">
                                    <p id="confirmEdit" onClick={updateResult} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                        update
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {races.length > 0 ?
                    <div>
                        <div className="text-6xl font-extrabold text-gray-700 p-6">
                            {"Today's Races"}
                        </div>
                        <div className='w-full my-0 mx-auto'>
                            <div className="p-6 w-3/4 m-auto">
                                <p id="addEntry" onClick={showAddBoatModal} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Add Entry
                                </p>
                            </div>
                        </div>
                        {races.map((race, index) => {
                            return (
                                <div className="m-6" key={JSON.stringify(races) + index}>
                                    <div className="text-4xl font-extrabold text-gray-700 p-6">
                                        {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                    </div>
                                    <SignOnTable data={race.results} updateResult={updateResult} createResult={createResult} clubId={clubId} showEditModal={showEditModal} />
                                </div>
                            )
                        })}

                    </div>
                    :
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                    </div>
                }
            </div>
            <div id="Results" className="hidden" >
                <div className="p-4">
                    <div className="text-6xl font-extrabold text-gray-700 p-6">
                        {activeRaceData.series.name}: {activeRaceData.number}
                    </div>
                    <FleetResultsTable data={activeRaceData.results} startTime={null} key={JSON.stringify(activeRaceData.results)} deleteResult={() => { }} updateResult={() => { }} createResult={() => { }} clubId={clubId} raceId={activeRaceData.id} />
                </div>
            </div>
            <div id="Guide" className="hidden" >
                <div className=' w-11/12 mx-auto my-3'>
                    <iframe
                        className='block w-full'
                        src="/0.2 Race Sign On Guide.pdf#toolbar=0"
                        height="800"
                    />

                </div>
            </div>
        </div>
    )
}

export default SignOnPage