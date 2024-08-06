'use client'
import React, { act, ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import FleetHandicapResultsTable from 'components/tables/FleetHandicapResultsTable';
import FleetPursuitResultsTable from 'components/tables/FleetPursuitResultsTable';
import * as Fetcher from 'components/Fetchers';
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";
import { PageSkeleton } from "components/ui/PageSkeleton";
import { BreadcrumbItem, Breadcrumbs, Button, Input, useDisclosure } from "@nextui-org/react";
import CreateResultModal from "components/ui/dashboard/CreateResultModal";
import ProgressModal from "components/ui/dashboard/ProgressModal";
import EditResultModal from "components/ui/dashboard/EditResultModal";

export default function Page({ params }: { params: { slug: string } }) {

    const Router = useRouter()

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const [seriesName, setSeriesName] = useState("")

    const createModal = useDisclosure();
    const progressModal = useDisclosure();
    const editModal = useDisclosure();

    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [progressIndeterminate, setProgressIndeterminate] = useState(false)

    var [activeResult, setActiveResult] = useState<ResultsDataType>()
    var [activeFleet, setActiveFleet] = useState<FleetDataType>()

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
        editModal.onClose()
        await DB.updateResult(result)
        var data = await DB.getRaceById(race.id)
        setRace(data)
    }

    // const editUpdateResult = async () => {
    //     let result = activeResult
    //     const Helm = document.getElementById('editHelm') as HTMLInputElement;
    //     result.Helm = Helm.value

    //     const Crew = document.getElementById("editCrew") as HTMLInputElement
    //     result.Crew = Crew.value

    //     result.boat = boatOption.value
    //     console.log(result.boat)

    //     result.resultCode = resultCodeOption.value

    //     const sailNum = document.getElementById("editSailNum") as HTMLInputElement
    //     result.SailNumber = sailNum.value

    //     const Position = document.getElementById("editPosition") as HTMLInputElement
    //     result.HandicapPosition = parseInt(Position.value)

    //     if (lapsAdvancedMode) {

    //         const LapData = document.getElementById("LapData") as HTMLElement
    //         let laps = Array.from(LapData.childNodes)
    //         console.log(laps)
    //         laps.pop()

    //         laps.forEach((element, index) => {
    //             let inputElement = element.childNodes[1]?.childNodes[0] as HTMLInputElement

    //             var parts = inputElement.value.split(':'); // split it at the colons

    //             // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
    //             var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
    //             //add lap time to fleet start time
    //             var unixTime = seconds + race.fleets.filter(fleet => fleet.id == result.fleetId)[0]!.startTime
    //             result.laps[index]!.time = unixTime

    //             if (index == laps.length - 1) {
    //                 result.finishTime = unixTime
    //             }
    //         });
    //     } else {
    //         const Laps = document.getElementById("NumberofLaps") as HTMLInputElement
    //         const numberofLaps = parseInt(Laps.value)
    //         const Finish = document.getElementById("FinishTime") as HTMLInputElement
    //         var parts = Finish.value.split(':'); // split it at the colons

    //         // minutes are 60 seconds. Hours are 60 minutes * 60 seconds.
    //         var seconds = (+parts[0]!) * 60 * 60 + (+parts[1]!) * 60 + (+parts[2]!);
    //         //add lap time to fleet start time
    //         var finishTime = seconds + race.fleets.filter(fleet => fleet.id == result.fleetId)[0]!.startTime

    //         console.log(finishTime)
    //         let entryLaps = activeResult.laps.length
    //         if (entryLaps == numberofLaps) {
    //             //don't do anything if there aren't any laps
    //             if (numberofLaps != 0) {
    //                 //don't have an update for the last lap
    //                 await DB.DeleteLapById(activeResult.laps[entryLaps - 1]!.id)
    //                 await DB.CreateLap(result.id, finishTime)
    //             }
    //         } else if (entryLaps < numberofLaps) {
    //             let difference = numberofLaps - entryLaps
    //             for (let i = 0; i < difference - 1; i++) {
    //                 await DB.CreateLap(result.id, 0)
    //             }
    //             await DB.CreateLap(result.id, finishTime)
    //         } else {
    //             if (numberofLaps == 0) {
    //                 //delete all laps
    //                 for (let i = 0; i < entryLaps; i++) {
    //                     await DB.DeleteLapById(activeResult.laps[i]!.id)
    //                 }
    //             } else {
    //                 //delete the extra laps
    //                 let difference = entryLaps - numberofLaps
    //                 console.log(difference)
    //                 console.log(result.laps)
    //                 for (let i = 0; i <= difference; i++) {
    //                     console.log(activeResult.laps[entryLaps - 1 - i]!.id)
    //                     await DB.DeleteLapById(activeResult.laps[entryLaps - 1 - i]!.id)
    //                 }
    //                 await DB.CreateLap(result.id, finishTime)
    //             }

    //         }
    //         result.finishTime = finishTime
    //     }
    //     //check that all data is present
    //     if (result.Helm == "" || result.boat.id == undefined || result.SailNumber == "") {
    //         alert("missing Helm or Sail Number or Lap Time")
    //         return
    //     }

    //     console.log(result)
    //     await DB.updateResult(result)

    //     setRace(await DB.getRaceById(race.id)) //force update as content has changed

    //     const modal = document.getElementById("editModal")
    //     modal?.classList.add("hidden")
    // }

    const deleteResult = async (result: ResultsDataType) => {
        await DB.DeleteResultById(result.id)
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

    const openRacePanel = async () => {
        if (race.Type == "Handicap") {
            Router.push('/HRace/' + race.id)

        } else {
            Router.push('/PRace/' + race.id)
        }
    }

    const showEditModal = async (resultId: string) => {
        console.log("this is running!")
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

        setActiveFleet(race.fleets.filter(fleet => fleet.id == result!.fleetId)[0]!)

        editModal.onOpen()
    }

    const saveRaceType = async (newValue: any) => {
        console.log(newValue)
        setRace({ ...race, Type: newValue.value })
        await DB.updateRaceById({ ...race, Type: newValue.value })
    }

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        progressModal.onOpen()
        setProgressIndeterminate(true)
        setProgressValue(0)
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results: any) {
                setProgressIndeterminate(false)
                setProgressMax(results.data.length)
                let index = 0
                for (const line of results.data) {
                    setProgressValue(++index)
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
                progressModal.onClose()
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
            <ProgressModal key={progressValue} isOpen={progressModal.isOpen} Value={progressValue} Max={progressMax} Indeterminate={progressIndeterminate} onClose={progressModal.onClose} />
            <EditResultModal isOpen={editModal.isOpen} result={activeResult} fleet={activeFleet} onSubmit={updateResult} onDelete={deleteResult} onClose={editModal.onClose} />
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
                                    <Button color="warning">
                                        Copy from previous race
                                    </Button>
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
                                        <FleetHandicapResultsTable showTime={true} editable={true} data={fleet.results} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={deleteResult} updateResult={updateResult} raceId={race.id} showEditModal={showEditModal} />
                                        :
                                        <FleetPursuitResultsTable showTime={true} editable={true} data={fleet.results} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={deleteResult} updateResult={updateResult} raceId={race.id} showEditModal={showEditModal} />
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