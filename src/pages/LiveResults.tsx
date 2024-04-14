import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../components/apiMethods';
import LiveResultsTable from "../components/LiveResultsTable";
import RaceTimer from "../components/HRaceTimer"


enum pageModes {
    live,
    results
}

const LiveResults = () => {
    const router = useRouter()

    const query = router.query

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
        startTime: 0,
        series: {} as SeriesDataType
    }])

    var [activeRace, setActiveRace] = useState<RaceDataType>({} as RaceDataType)

    var [mode, setMode] = useState<pageModes>(pageModes.results)

    const calculateHandicapResults = (race: RaceDataType) => {
        //most nuber of laps.
        const maxLaps = Math.max.apply(null, race.results.map(function (o: ResultsDataType) { return o.lapTimes.times.length }))

        const resultsData = [...race.results]

        //calculate corrected time
        resultsData.forEach(result => {
            let seconds = result.lapTimes.times[result.lapTimes.times.length - 1] - race.startTime
            result.CorrectedTime = (seconds * 1000 * (maxLaps / result.lapTimes.times.length)) / result.boat.py
            if (result.finishTime == -1) {
                result.CorrectedTime = 99999
            }
        });

        //calculate finish position

        const sortedResults: ResultsDataType[] = resultsData.sort((a, b) => a.CorrectedTime - b.CorrectedTime);
        sortedResults.forEach((result, index) => {
            result.Position = index + 1;
        });

        return (sortedResults)
    }

    const calculatePursuitResults = (race: RaceDataType) => {
        return race
    }

    const checkActive = (race: RaceDataType) => {
        if (race.startTime != 0) {
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
        setClubId(Cookies.get('clubId') || "")
    }, [router])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }


            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                console.log(data)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        console.log(data[i]!.number)
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
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
                    console.log("here")
                    setMode(pageModes.live)
                    if (racesCopy[i]!.Type == "Handicap") {
                        racesCopy[i]!.results = calculateHandicapResults(racesCopy[i]!)
                    } else {
                        calculatePursuitResults(racesCopy[i]!)
                    }
                    setActiveRace(racesCopy[i]!)
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
                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                                    Race Time: <RaceTimer startTime={activeRace.startTime} timerActive={true} onFiveMinutes={null} onFourMinutes={null} onOneMinute={null} onGo={null} onWarning={null} reset={false} />
                                </div>
                                <div className="m-6" key={activeRace.id}>
                                    <div className="text-4xl font-extrabold text-gray-700 p-6">
                                        {activeRace.series.name}: {activeRace.number} at {activeRace.Time.slice(10, 16)}
                                    </div>
                                    <LiveResultsTable data={activeRace} />
                                </div>

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
                                            <LiveResultsTable data={race} />
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