import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../../components/apiMethods';
import LiveFleetResultsTable from "../../components/LiveFleetResultsTable";
import RaceTimer from "../../components/HRaceTimer"


enum pageModes {
    live,
    results
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
        results: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    }])

    const [fleets, setFleets] = useState<FleetDataType[][]>([[] as FleetDataType[]])

    var [activeRace, setActiveRace] = useState<RaceDataType>({} as RaceDataType)
    const [activeFleets, setActiveFleets] = useState<FleetDataType[]>([])

    var [mode, setMode] = useState<pageModes>(pageModes.results)

    const calculateHandicapResults = (race: RaceDataType) => {
        //most nuber of laps.
        const maxLaps = Math.max.apply(null, race.results.map(function (o: ResultsDataType) { return o.laps.length }))

        const resultsData = [...race.results]

        //calculate corrected time
        resultsData.forEach(result => {
            const fleet = fleets.flat().find(fleet => fleet.id == result.fleetId)
            if (!fleet) {
                console.error("fleet not found")
                return
            }
            let seconds = result.lapTimes.times[result.lapTimes.times.length - 1] - fleet.startTime
            result.CorrectedTime = (seconds * 1000 * (maxLaps / result.lapTimes.times.length)) / result.boat.py
            if (result.finishTime == -1) {
                result.CorrectedTime = 99999
            }
        });

        //calculate finish position

        const sortedResults: ResultsDataType[] = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);

        return (sortedResults)
    }

    const calculatePursuitResults = (race: RaceDataType) => {
        return race
    }

    const checkActive = (race: RaceDataType) => {
        const fleet = fleets.flat().filter(fleet => fleet.seriesId == race.seriesId)
        if (fleet.length == 0) {
            console.error("no fleets found")
        }

        //if any fleets have been started
        if (fleet.some((fleet) => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.results.every((result) => {
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
                    let fleetsCopy: FleetDataType[][] = []
                    for (let i = 0; i < data.length; i++) {
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                        const fleetData = await DB.GetFleetsBySeries(res.seriesId)
                        fleetsCopy[i] = fleetData
                    }
                    console.log(racesCopy)
                    setRaces(racesCopy)
                    setFleets(fleetsCopy)
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
                    console.log("here")
                    setMode(pageModes.live)
                    if (racesCopy[i]!.Type == "Handicap") {
                        racesCopy[i]!.results = calculateHandicapResults(racesCopy[i]!)
                    } else {
                        calculatePursuitResults(racesCopy[i]!)
                    }
                    setActiveRace(racesCopy[i]!)
                    setActiveFleets(fleets.flat().filter(fleet => fleet.seriesId == racesCopy[i]!.seriesId))
                    activeFlag = true
                    break
                }
            }
            if (!activeFlag) {
                setMode(pageModes.results)
                for (let i = 0; i < racesCopy.length; i++) {
                    if (racesCopy[i]!.Type == "Handicap") {
                        racesCopy[i]!.results = calculateHandicapResults(racesCopy[i]!)
                    } else {
                        calculatePursuitResults(racesCopy[i]!)
                    }
                }
                setRaces(racesCopy)
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
                            <div>
                                {activeFleets.map((fleet, index) => {
                                    return (
                                        <>
                                            <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                                <div key={fleet.id}>
                                                    Race Time: <RaceTimer startTime={fleet.startTime} timerActive={true} onFiveMinutes={null} onFourMinutes={null} onOneMinute={null} onGo={null} onWarning={null} reset={false} />
                                                </div>
                                            </div>
                                            <div className="m-6" key={activeRace.id}>
                                                <div className="text-4xl font-extrabold text-gray-700 p-6">
                                                    {activeRace.series.name}: {activeRace.number} at {activeRace.Time.slice(10, 16)}
                                                </div>
                                                <LiveFleetResultsTable data={activeRace.results} startTime={fleet.startTime} />
                                            </div>
                                        </>
                                    )
                                })}

                            </div>
                        )
                    case pageModes.results:
                        return (
                            <div key={JSON.stringify(races)}>
                                {races.map((race, index) => {
                                    return (
                                        <div className="m-6" key={race.id}>
                                            <div className="text-4xl font-extrabold text-gray-700 p-6">
                                                {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                            </div>
                                            <LiveFleetResultsTable data={race.results} startTime={0} />
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    default: //countdown and starting and allStarted
                        return (
                            <div>
                                <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                            </div>
                        )
                }
            })()}
        </div>
    );
}

export default LiveResults;