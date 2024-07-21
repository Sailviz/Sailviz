'use client'
import { useEffect, useState } from "react";
import Layout from "components/ui/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import LiveFleetResultsTable from "components/tables/LiveFleetResultsTable";
import RaceTimer from "components/HRaceTimer"


enum pageModes {
    live,
    notLive
}

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter()

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
        let clubName = params.slug
        if (clubName) {
            DB.getClubByName(clubName.toString()).then((data) => {
                if (data) {
                    setClubId(data.id)
                } else {
                    console.log("could not find club")
                }
            })
        }
    }, [Router])

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
            Router.push("/")
        }
    }, [clubId])


    useEffect(() => {
        const timer1 = setTimeout(async () => {
            let activeFlag = false
            console.log("refreshing results")

            //check if any of the races are active
            for (let race of races) {
                race = await DB.getRaceById(race.id)
                if (checkActive(race)) {
                    setMode(pageModes.live)
                    setActiveRace(race)
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
                                                <LiveFleetResultsTable fleet={fleet} startTime={fleet.startTime} handicap={activeRace.Type} />
                                            </div>
                                        </>
                                    )
                                })}

                            </div>
                        )
                    default: //includes notLive state
                        return (
                            <div>
                                <p className="text-6xl font-extrabold text-gray-700 p-6"> {params.slug} <br /> No Races Currently Active</p>
                            </div>
                        )
                }
            })()}
        </div>
    );
}