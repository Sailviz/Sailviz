'use client'
import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import dayjs from 'dayjs';
import Select from 'react-select';
import Papa from 'papaparse';
import FleetHandicapResultsTable from 'components/tables/FleetHandicapResultsTable';
import FleetPursuitResultsTable from 'components/tables/FleetPursuitResultsTable';
import Switch from "components/ui/Switch";
import * as Fetcher from 'components/Fetchers';
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";
import { PageSkeleton } from "components/ui/PageSkeleton";
import { BreadcrumbItem, Breadcrumbs, Button, Input, useDisclosure } from "@nextui-org/react";
import CreateResultModal from "components/ui/dashboard/CreateResultModal";
import { set } from "cypress/types/lodash";

const raceOptions = [{ value: "Pursuit", label: "Pursuit" }, { value: "Handicap", label: "Handicap" }]

const resultCodeOptions = [
    { label: 'None', value: '' },
    { label: 'Did Not Finish', value: 'DNF' },
    { label: 'Did Not Start', value: 'DNS' },
    { label: 'Disqualified', value: 'DSQ' },
    { label: 'On Course Side', value: 'OCS' },
    { label: 'Not Sailed Course', value: 'NSC' }]

export default function Page({ params }: { params: { slug: string } }) {

    const Router = useRouter()

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats(club)

    const [seriesName, setSeriesName] = useState("")

    const createModal = useDisclosure();

    var [activeResult, setActiveResult] = useState<ResultsDataType>({
        id: "",
        raceId: "",
        Helm: "",
        Crew: "",
        boat: {} as BoatDataType,
        SailNumber: "",
        finishTime: 0,
        CorrectedTime: 0,
        laps: [{
            time: 0,
            id: "",
            resultId: ""
        }],
        PursuitPosition: 0,
        HandicapPosition: 0,
        resultCode: "",
        fleetId: ""
    })

    const [boatOption, setBoatOption] = useState({ label: "", value: {} as BoatDataType })
    const [resultCodeOption, setResultCodeOption] = useState({ label: "", value: "" })
    const [lapsAdvancedMode, setLapsAdvancedMode] = useState(false)
    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    var [race, setRace] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [{
            id: "",
            startTime: 0,
            raceId: "",
            fleetSettings: {
                id: "",
                name: "",
                boats: [],
                startDelay: 0,
                fleets: []
            } as FleetSettingsType,
            results: [{
                id: "",
                raceId: "",
                Helm: "",
                Crew: "",
                boat: {} as BoatDataType,
                SailNumber: "",
                finishTime: 0,
                CorrectedTime: 0,
                laps: [{
                    time: 0,
                    id: "",
                    resultId: ""
                }],
                PursuitPosition: 0,
                HandicapPosition: 0,
                resultCode: "",
                fleetId: ""
            } as ResultsDataType]

        }],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })

    const createResult = async (helm: string, crew: string, boat: BoatDataType, sailNum: string, fleetId: string) => {
        console.log(helm, crew, boat, sailNum, fleetId)
        createModal.onClose() //close modal
        await DB.createResult(fleetId[0]!)
        setRace(await DB.getRaceById(race.id))
    }

    const updateResult = async (result: ResultsDataType) => {
        await DB.updateResult(result)
        var data = await DB.getRaceById(race.id)
        setRace(data)
    }

    const editUpdateResult = async () => {
        let result = activeResult
        const Helm = document.getElementById('editHelm') as HTMLInputElement;
        result.Helm = Helm.value

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        result.Crew = Crew.value

        result.boat = boatOption.value
        console.log(result.boat)

        result.resultCode = resultCodeOption.value

        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        result.SailNumber = sailNum.value

        const Position = document.getElementById("editPosition") as HTMLInputElement
        result.HandicapPosition = parseInt(Position.value)

        if (lapsAdvancedMode) {

            const LapData = document.getElementById("LapData") as HTMLElement
            let laps = Array.from(LapData.childNodes)
            console.log(laps)
            laps.pop()

            laps.forEach((element, index) => {
                let inputElement = element.childNodes[1]?.childNodes[0] as HTMLInputElement

                var parts = inputElement.value.split(':'); // split it at the colons

                // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
                var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
                //add lap time to fleet start time
                var unixTime = seconds + race.fleets.filter(fleet => fleet.id == result.fleetId)[0]!.startTime
                result.laps[index]!.time = unixTime

                if (index == laps.length - 1) {
                    result.finishTime = unixTime
                }
            });
        } else {
            const Laps = document.getElementById("NumberofLaps") as HTMLInputElement
            const numberofLaps = parseInt(Laps.value)
            const Finish = document.getElementById("FinishTime") as HTMLInputElement
            var parts = Finish.value.split(':'); // split it at the colons

            // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
            var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
            //add lap time to fleet start time
            var finishTime = seconds + race.fleets.filter(fleet => fleet.id == result.fleetId)[0]!.startTime

            console.log(finishTime)
            let entryLaps = activeResult.laps.length
            if (entryLaps == numberofLaps) {
                //don't do anything if there aren't any laps
                if (numberofLaps != 0) {
                    //don't have an update for the last lap
                    await DB.DeleteLapById(activeResult.laps[entryLaps - 1]!.id)
                    await DB.CreateLap(result.id, finishTime)
                }
            } else if (entryLaps < numberofLaps) {
                let difference = numberofLaps - entryLaps
                for (let i = 0; i < difference - 1; i++) {
                    await DB.CreateLap(result.id, 0)
                }
                await DB.CreateLap(result.id, finishTime)
            } else {
                if (numberofLaps == 0) {
                    //delete all laps
                    for (let i = 0; i < entryLaps; i++) {
                        await DB.DeleteLapById(activeResult.laps[i]!.id)
                    }
                } else {
                    //delete the extra laps
                    let difference = entryLaps - numberofLaps
                    console.log(difference)
                    console.log(result.laps)
                    for (let i = 0; i <= difference; i++) {
                        console.log(activeResult.laps[entryLaps - 1 - i]!.id)
                        await DB.DeleteLapById(activeResult.laps[entryLaps - 1 - i]!.id)
                    }
                    await DB.CreateLap(result.id, finishTime)
                }

            }
            result.finishTime = finishTime
        }
        //check that all data is present
        if (result.Helm == "" || result.boat.id == undefined || result.SailNumber == "") {
            alert("missing Helm or Sail Number or Lap Time")
            return
        }

        console.log(result)
        await DB.updateResult(result)

        setRace(await DB.getRaceById(race.id)) //force update as content has changed

        const modal = document.getElementById("editModal")
        modal?.classList.add("hidden")
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
        setRace(await DB.getRaceById(race.id))
    }

    const printRaceSheet = async () => {
        Router.push('/PrintPaperResults/' + race.id)
    }

    //Capitalise the first letter of each word, and maintain cursor pos.
    const saveRaceSettings = (e: ChangeEvent<HTMLInputElement>) => {
        let newRaceData: RaceDataType = race
        const sentence = e.target.value.split(' ');
        const cursorPos = e.target.selectionStart
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const calitalisedSentence = capitalizedWords.join(' ')

        // use e.target.id to update the correct field in the race data
        switch (e.target.id) {
            case "OOD":
                newRaceData.OOD = calitalisedSentence
                break;
            case "AOD":
                newRaceData.AOD = calitalisedSentence
                break;
            case "SO":
                newRaceData.SO = calitalisedSentence
                break;
            case "ASO":
                newRaceData.ASO = calitalisedSentence
                break;
            case "Time":
                newRaceData.Time = e.target.value
                break;
            case "raceType":
                newRaceData.Type = e.target.value
                break;
            default:
                break;
        }
        setRace(newRaceData)

        let inputElement = document.getElementById(e.target.id) as HTMLInputElement
        inputElement.value = calitalisedSentence
        inputElement.selectionStart = cursorPos
    }

    const saveRaceDate = async (e: ChangeEvent<HTMLInputElement>) => {
        var time = e.target.value
        time = time.replace('T', ' ')
        var day = dayjs(time)
        if (day.isValid()) {
            console.log(time)
            await DB.updateRaceById({ ...race, Time: time })
        } else {
            console.log("date is not valid input")
        }
    }

    const openRacePanel = async () => {
        if (race.Type == "Handicap") {
            Router.push('/HRace/' + race.id)

        } else {
            Router.push('/PRace/' + race.id)
        }
    }

    const showEditModal = async (resultId: string) => {
        console.log(resultId)
        let result: ResultsDataType | undefined;
        let results = race.fleets.flatMap(fleet => fleet.results)
        result = results.find(result => result.id == resultId)
        if (result == undefined) {
            console.error("Could not find result with id: " + resultId);
            return
        }
        console.log(result)
        result.laps.sort((a, b) => a.time - b.time)
        setActiveResult({ ...result })

        console.log(result)
        const Helm = document.getElementById("editHelm") as HTMLInputElement
        console.log(Helm.value)
        Helm.setAttribute("value", result.Helm)
        console.log(Helm.value)

        const Crew = document.getElementById("editCrew") as HTMLInputElement
        Crew.value = result.Crew


        const sailNum = document.getElementById("editSailNum") as HTMLInputElement
        sailNum.value = result.SailNumber

        const position = document.getElementById("editPosition") as HTMLInputElement
        position.value = result.HandicapPosition.toString()

        const resultid = document.getElementById("EditResultId") as HTMLInputElement
        resultid.innerHTML = result.id

        try {
            setBoatOption({ value: result.boat, label: result.boat.name })
        } catch (error) {
            //result does not have boat assigned
        }
        try {
            setResultCodeOption({ value: result.resultCode, label: resultCodeOptions.find(code => code.value == result!.resultCode!)!.label })
        } catch (error) {
            //result does not have boat assigned
        }
        const modal = document.getElementById("editModal")
        modal!.classList.remove("hidden")
    }

    const addLap = async () => {
        await DB.CreateLap(activeResult.id, 0)
        let result = await DB.GetResultById(activeResult.id)

        //order by time, but force 0 times to end
        result.laps.sort((a, b) => {
            if (a.time == 0) return 1
            if (b.time == 0) return -1
            return a.time - b.time
        })

        setActiveResult(result)
    }

    const removeLap = async (index: number) => {
        await DB.DeleteLapById(activeResult.laps[index]!.id)
        let result = await DB.GetResultById(activeResult.id)

        //order by time, but force 0 times to end
        result.laps.sort((a, b) => {
            if (a.time == 0) return 1
            if (b.time == 0) return -1
            return a.time - b.time
        })

        setActiveResult(result)
    }

    const saveRaceType = async (newValue: any) => {
        console.log(newValue)
        setRace({ ...race, Type: newValue.value })
        await DB.updateRaceById({ ...race, Type: newValue.value })
    }

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results: any) {
                console.log(results.data)
                for (const line of results.data) {
                    //check if all fields are present
                    if (line.Helm == undefined || line.Crew == undefined || line.Boat == undefined || line.SailNumber == undefined) {
                        alert("missing fields")
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
                    let boat = boats.find(boat => boat.name == boatName)
                    if (boat == undefined) {
                        console.error("Boat " + boatName + " not found")
                    } else {
                        result.boat = boat
                    }
                    console.log(result)
                    //update with info
                    await DB.updateResult(result)

                }
                setRace(await DB.getRaceById(race.id))
            },
        });
    }

    const downloadResults = async () => {
        var csvRows: string[] = []
        const headers = ['HelmName', 'CrewName', 'Class', 'SailNo', 'Laps', 'Elapsed', 'Code']

        csvRows.push(headers.join(','));

        race.fleets.forEach(fleet => {
            fleet.results.forEach(result => {
                var time = new Date((result.finishTime - fleet.startTime) * 1000).toISOString().substring(11, 19)
                var values = [result.Helm, result.Crew, result.boat.name, result.SailNumber, result.laps.length, (result.finishTime == -1 ? '' : time), result.resultCode]
                //join values with comma
                csvRows.push(values.join(','))
            })
            //join results with new line
            let data = csvRows.join('\n')

            // Creating a Blob for having a csv file format  
            // and passing the data with type 
            const blob = new Blob([data], { type: 'text/csv' });

            // Creating an object for downloading url 
            const url = window.URL.createObjectURL(blob)

            // Creating an anchor(a) tag of HTML 
            const a = document.createElement('a')

            // Passing the blob downloading url  
            a.setAttribute('href', url)

            // Setting the anchor tag attribute for downloading 
            // and passing the download file name 
            a.setAttribute('download', seriesName + ' ' + race.number + ': ' + fleet.fleetSettings.name + ' ' + 'results.csv');

            // Performing a download with click 
            a.click()
        })
    }

    useEffect(() => {
        let raceId = params.slug
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId)
            setRace(racedata)
            DB.GetSeriesById(racedata.seriesId).then((series: SeriesDataType) => {
                setSeriesName(series.name)
            })
        }

        if (raceId != undefined) {
            getRace()
        }

    }, [Router])



    useEffect(() => {
        let timer1 = setTimeout(async () => {
            console.log(document.activeElement?.tagName)
            if (document.activeElement?.tagName == "INPUT") {
                return
            }
            if (race.id == "") return
            var data = await DB.getRaceById(race.id)
            setRace({ ...data })
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [race]);
    if (userIsValidating || clubIsValidating || user == undefined || club == undefined || boats == undefined) {
        return (
            <PageSkeleton />
        )
    }
    return (
        <div id="race" className='h-full w-full overflow-y-auto'>
            <CreateResultModal isOpen={createModal.isOpen} race={race} boats={boats} onSubmit={createResult} onClose={createModal.onClose} />
            <div id="editModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"} key={activeResult.id}>
                <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("editModal")!.classList.add("hidden") }}>&times;</div>
                    <div className="text-6xl font-extrabold text-gray-700 p-6">Edit Entry</div>
                    <div className="flex w-3/4">
                        <div className='flex flex-col px-6 w-full'>
                            <p className='hidden' id="EditResultId">

                            </p>
                            <p className='text-2xl font-bold text-gray-700'>
                                Helm
                            </p>
                            <input type="text" id="editHelm" className="h-full text-2xl p-4" />
                        </div>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Crew
                            </p>

                            <input type="text" id="editCrew" className="h-full text-2xl p-4" />
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
                                    value={boatOption}
                                    onChange={(choice) => setBoatOption(choice!)}
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
                    <div className="flex flex-row mt-2">
                        <div className='flex flex-col px-6 w-1/4'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Position
                            </p>

                            <input type="number" id="editPosition" className="h-full text-2xl p-4" />
                        </div>
                        <div className='flex flex-col px-6 w-1/4'>
                            <p className='text-2xl font-bold text-gray-700'>
                                Finish Code
                            </p>
                            <div className="w-full p-2 mx-0 my-2">
                                <Select
                                    id="editResultCode"
                                    className=' w-56 h-full text-3xl'
                                    options={resultCodeOptions}
                                    value={resultCodeOption}
                                    onChange={(choice) => setResultCodeOption(choice!)}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-row">
                            <p className="text-6xl font-extrabold text-gray-700 p-6">
                                Result Info
                            </p>
                            <div className="flex flex-row">
                                <div className="py-4">
                                    <Switch
                                        id={"AdvancedModeSwitch"}
                                        isOn={lapsAdvancedMode}
                                        onColour="#02c66f"
                                        handleToggle={() => { setLapsAdvancedMode(!lapsAdvancedMode) }}
                                    />
                                </div>
                                <label className=" pl-6 py-12 text-2xl font-bold text-gray-700" htmlFor={"AdvancedModeSwitch"}>Advanced Mode</label>
                            </div>
                        </div>
                        {lapsAdvancedMode ?
                            <div className='flex flex-row w-full flex-wrap' id='LapData' key={JSON.stringify(activeResult)}>
                                {/* this map loops through laps in results, unless it can't find any*/}
                                {activeResult.laps.map((lap: LapDataType, index: number) => {
                                    return (
                                        <div className='flex flex-col px-6 w-min' key={lap.time + index}>
                                            <p className='text-2xl font-bold text-gray-700 p-2'>
                                                Lap {index + 1}
                                            </p>
                                            <div className='flex flex-row'>
                                                <input type="time" className="h-full text-xl p-4" step={"1"} defaultValue={new Date(Math.max(0, (lap.time - (race.fleets.find(fleet => fleet.id == activeResult.fleetId) || { startTime: 0 } as FleetDataType).startTime) * 1000)).toISOString().substring(11, 19)} />
                                                <div className="text-6xl font-extrabold text-red-600 p-6 float-right cursor-pointer" onClick={() => removeLap(index)}>&times;</div>
                                            </div>

                                        </div>
                                    )
                                })}
                                <div className="p-4 mr-2 w-96 flex justify-end">
                                    <p onClick={addLap} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                        Add Lap
                                    </p>
                                </div>
                            </div>
                            :
                            <div className="flex flex-row mt-2">
                                <div className='flex flex-col px-6 w-1/4'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Laps
                                    </p>

                                    <input type="number" id="NumberofLaps" className="h-full text-2xl p-4" defaultValue={activeResult.laps.length} />
                                </div>
                                <div className='flex flex-col px-6 w-1/4'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Finish Time
                                    </p>

                                    <input type="time" id="FinishTime" className="h-full text-xl p-4" step={"1"} defaultValue={new Date(Math.max(0, (activeResult.finishTime - (race.fleets.find(fleet => fleet.id == activeResult.fleetId) || { startTime: 0 } as FleetDataType).startTime) * 1000)).toISOString().substring(11, 19)} />

                                </div>
                            </div>
                        }
                    </div>
                    <div className="flex flex-row justify-end">
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmRemove" onClick={() => { deleteResult(activeResult.id); document.getElementById("editModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                    Remove
                                </p>
                            </div>
                        </div>
                        <div className=" flex justify-end mt-8">
                            <div className="p-4 mr-2">
                                <p id="confirmEdit" onClick={editUpdateResult} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                    update
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 w-full">
                <div className="flex flex-wrap px-4 divide-y divide-solid w-full justify-center">
                    <div className="py-4 w-3/5">
                        <Breadcrumbs>
                            <BreadcrumbItem onClick={() => Router.push('/Series/' + race.seriesId)}>{seriesName}</BreadcrumbItem>
                            <BreadcrumbItem>Race {race.number} </BreadcrumbItem>
                        </Breadcrumbs>
                        <p className="text-2xl">{race.Type} Race</p>
                        <p className="text-2xl">{dayjs(race.Time).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <div className="py-4 w-3/5 justify-center">
                        <p className="text-xl font-medium text-center">Duty Team</p>
                        <form className="flex">
                            <div className="flex-col w-full mr-4">
                                <div className="flex items-center py-4">
                                    <label htmlFor="RO"
                                        className="block mb-2 font-medium text-gray-900 dark:text-white w-1/4">RO</label>
                                    <Input type="text" id="RO"
                                        placeholder="Race Officer" />
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="ARO"
                                        className="block mb-2 font-medium text-gray-900 dark:text-white w-1/4">ARO</label>
                                    <Input type="text" id="ARO"
                                        placeholder="Assistant Race Officer" />
                                </div>
                            </div>
                            <div className="flex-col w-full mr-4">
                                <div className="flex items-center py-4">
                                    <label htmlFor="SO"
                                        className="block mb-2 font-medium text-gray-900 dark:text-white w-1/4">SO</label>
                                    <Input type="text" id="SO"
                                        placeholder="Safety Officer" />
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="ASO"
                                        className="block mb-2 font-medium text-gray-900 dark:text-white w-1/4">ASO</label>
                                    <Input type="text" id="ASO"
                                        placeholder="Assistant Safety Officer" />
                                </div>
                            </div>
                            <div className="flex-col w-full mr-4">
                                <div className="flex items-center py-4">
                                    <label htmlFor="DO"
                                        className="block mb-2 font-medium text-gray-900 dark:text-white w-1/4">DO</label>
                                    <Input type="text" id="DO"
                                        placeholder="Duty Officer" />
                                </div>
                                <div className="flex items-center justify-center">
                                    <button className="btn-darkblue">Copy from previous race</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="py-4 w-4/5">
                        <div className="flex flex-wrap justify-center">
                            <Button className="mx-1" onClick={() => openRacePanel()}>Race</Button>
                            <Button className="mx-1" onClick={createModal.onOpen}>Add Entry</Button>
                            <Button className="mx-1">Calculate</Button>
                            <Button className="mx-1" onClick={() => printRaceSheet()}>Print Race Sheet</Button>
                            {userHasPermission(user, AVAILABLE_PERMISSIONS.UploadEntires) ?
                                <>
                                    <Button className="mx-1" onClick={() => document.getElementById("entryFileUpload")!.click()}>Upload Entries</Button>
                                    <Input
                                        id="entryFileUpload"
                                        type="file"
                                        accept=".csv"
                                        onChange={entryFileUploadHandler}
                                        className="hidden"
                                    />
                                </>
                                :
                                <></>
                            }
                            {userHasPermission(user, AVAILABLE_PERMISSIONS.DownloadResults) ?
                                <Button onClick={downloadResults} >
                                    Download Results
                                </Button>
                                :
                                <></>
                            }
                        </div>
                    </div>
                    <div className="py-4 w-full">
                        {race.fleets.map((fleet, index) => {
                            return (
                                <div key={"fleetResults" + index}>
                                    <p className='text-2xl font-bol'>
                                        {fleet.fleetSettings.name} - Boats Entered: {fleet.results.length}
                                    </p>
                                    {race.Type == "Handicap" ?
                                        <FleetHandicapResultsTable showTime={true} editable={true} data={fleet.results} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={deleteResult} updateResult={updateResult} raceId={race.id} showEditModal={(id: string) => { showEditModal(id) }} />
                                        :
                                        <FleetPursuitResultsTable showTime={true} editable={true} data={fleet.results} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={deleteResult} updateResult={updateResult} raceId={race.id} showEditModal={(id: string) => { showEditModal(id) }} />
                                    }

                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}