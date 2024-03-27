import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../components/apiMethods';
import LiveResultsTable from "../components/LiveResultsTable";

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

    const calculateHandicapResults = (race: RaceDataType) => {
        //most nuber of laps.
        const maxLaps = Math.max.apply(null, race.results.map(function (o: ResultsDataType) { return o.lapTimes.times.length }))

        const resultsData = [...race.results]

        //calculate corrected time
        resultsData.forEach(result => {
            let seconds = result.finishTime - race.startTime
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
            console.log("refreshing results")
            let racesCopy = window.structuredClone(races)
            for (let i = 0; i < racesCopy.length; i++) {
                var data = await DB.getRaceById(racesCopy[i]!.id)
                if (data.Type == "Handicap") {
                    data.results = calculateHandicapResults(data)
                } else {
                    calculatePursuitResults(data)
                }
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
            {races.length > 0 ?
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
                :
                <div>
                    <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                </div>
            }
        </div>
    );
}

export default LiveResults;