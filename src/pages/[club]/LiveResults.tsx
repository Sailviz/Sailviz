import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../../components/apiMethods';
import LiveFleetResultsTable from "../../components/LiveFleetResultsTable";
import RaceTimer from "../../components/HRaceTimer"


enum pageModes {
    live,
    notLive
}

const LiveResults = () => {
    const router = useRouter()

    var [clubId, setClubId] = useState<string>("invalid")
    var [races, setRaces] = useState<RaceDataType[]>([{
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    }])

    var results

    var [activeRace, setActiveRace] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    } as RaceDataType)

    var [mode, setMode] = useState<pageModes>(pageModes.notLive)

    const calculateHandicapResults = (fleet: FleetDataType) => {
        //most nuber of laps.
        const maxLaps = Math.max.apply(null, fleet.results.map(function (o: ResultsDataType) { return o.laps.length }))

        //calculate corrected time
        fleet.results.forEach(result => {
            //don't know why types aren't quite working here
            if (result.laps.length == 0) { return }
            let seconds = result.laps[result.laps.length - 1]!.time - fleet.startTime
            result.CorrectedTime = (seconds * 1000 * (maxLaps / result.laps.length)) / result.boat.py
            console.log(result.CorrectedTime)
        });

        //calculate finish position

        //sort by corrected time, if corrected time is 0 move to end, and rtd to end
        fleet.results.sort((a, b) => {
            if (a.resultCode == "RTD") {
                return 1
            }
            if (b.resultCode == "RTD") {
                return -1
            }
            if (a.CorrectedTime == 0) {
                return 1
            }
            if (b.CorrectedTime == 0) {
                return 1
            }
            if (a.CorrectedTime > b.CorrectedTime) {
                return 1
            }
            if (a.CorrectedTime < b.CorrectedTime) {
                return -1
            }
            return 0
        })

        fleet.results.forEach((result, index) => {
            result.HandicapPosition = index + 1
        })
        return fleet
    }

    const calculatePursuitResults = (race: RaceDataType) => {
        return race
    }

    const checkActive = (race: RaceDataType) => {
        if (race.fleets.length == 0) {
            console.error("no fleets found")
        }

        //if any fleets have been started
        if (race.fleets.some((fleet) => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.fleets.flatMap(fleet => fleet.results).every((result) => {
                if (result.finishTime != 0) {
                    return true
                }
            })
        }
        return false
    }

    useEffect(() => {
        let clubName = router.query.club
        if (clubName) {
            DB.getClubByName(clubName.toString()).then((data) => {
                if (data) {
                    setClubId(data.id)
                } else {
                    console.log("could not find club")
                }
            })
        }
    }, [router])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }


            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                        if (checkActive(racesCopy[i]!)) {
                            setMode(pageModes.live)
                            setActiveRace(racesCopy[i]!)
                        }
                    }
                    console.log(racesCopy)
                    setRaces(racesCopy)
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
        const timer1 = setTimeout(async () => {
            let activeFlag = false
            console.log("refreshing results")
            let racesCopy = window.structuredClone(races)
            //update local copy of results
            for (let i = 0; i < racesCopy.length; i++) {
                var data = await DB.getRaceById(racesCopy[i]!.id)
                racesCopy[i] = data
            }
            //check if any of the races are active
            for (let i = 0; i < racesCopy.length; i++) {
                if (checkActive(racesCopy[i]!)) {
                    setMode(pageModes.live)
                    if (racesCopy[i]!.Type == "Handicap") {
                        racesCopy[i]!.fleets.forEach((fleet, index) => {
                            racesCopy[i]!.fleets[index] = calculateHandicapResults(fleet) //do something with this
                        })
                    } else {
                        calculatePursuitResults(racesCopy[i]!)
                    }
                    console.log(racesCopy[i]!)
                    setActiveRace(racesCopy[i]!)
                    activeFlag = true
                    break
                }
            }
            if (!activeFlag) {
                setMode(pageModes.notLive)
            }
        }, 5000);
        return () => {
            clearTimeout(timer1);
        }
    }, [races, activeRace]);

    return (
        <div>
            {(() => {
                switch (mode) {
                    case pageModes.live:
                        return (
                            <div key={JSON.stringify(activeRace)}>
                                {activeRace.fleets.map((fleet, index) => {
                                    //change this to select the active race.
                                    return (
                                        <>
                                            <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                                <div key={fleet.id}>
                                                    Race Time: <RaceTimer startTime={fleet.startTime} timerActive={true} onFiveMinutes={null} onFourMinutes={null} onOneMinute={null} onGo={null} onWarning={null} reset={false} />
                                                </div>
                                            </div>
                                            <div className="m-6" key={activeRace.id}>
                                                <div className="text-4xl font-extrabold text-gray-700 p-6">
                                                    {activeRace.series.name}: {activeRace.number} - {fleet.fleetSettings.name}
                                                </div>
                                                <LiveFleetResultsTable data={fleet.results} startTime={fleet.startTime} handicap={activeRace.Type} />
                                            </div>
                                        </>
                                    )
                                })}

                            </div>
                        )
                    default: //includes notLive state
                        return (
                            <div>
                                <p className="text-6xl font-extrabold text-gray-700 p-6"> {router.query.club} <br /> No Races Currently Active</p>
                            </div>
                        )
                }
            })()}
        </div>
    );
}

export default LiveResults;