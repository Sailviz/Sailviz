import React, { useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Dashboard from "../components/Dashboard";

const RacePage = () => {

    const router = useRouter()

    const query = router.query

    var [seriesName, setSeriesName] = useState("")

    var [Instructions, setInstructions] = useState("Hit Start when ready to start the starting procedure")

    var [race, setRace] = useState<RaceDataType>(({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        results: [{
            id: "",
            raceId: "",
            Helm: "",
            Crew: "",
            boat: {},
            SailNumber: 0,
            Time: "",
            CorrectedTime: 0,
            Laps: 0,
            Position: 0,
        }],
        Type: "",
        seriesId: ""
        //extra fields required for actually racing.
        //start time - UTC of start of 5 min count down.
    }))

    const startRace = async () => {
        fetch("http://192.168.1.223/start", { mode: 'no-cors' }).then((res) => {
            if (res.status !== 200) {
                console.log("clock start failed with " + res.status)
            }
        }

        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
    }

    useEffect(() => {
        let raceId = query.race as string
        console.log(raceId)
        const fetchRace = async () => {
            let data = await DB.getRaceById(raceId)
            console.log(data.race)
            setRace(data.race)

            setSeriesName(await DB.GetSeriesById(data.race.seriesId).then((res) => { return (res.name) }))
        }
        if (raceId != undefined) {
            fetchRace()
        }
    }, [router])

    return (
        <Dashboard>
            <div className="w-full flex flex-col items-center justify-start panel-height">
                <div className="flex w-full shrink flex-row justify-around">
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Event: {seriesName} - {race.number}
                    </div>
                    <div className="shrink w-1/4 p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        Race Time:
                    </div>
                    <div className="p-2 w-1/4">
                        <p onClick={startRace} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                            Start
                        </p>
                    </div>
                </div>
                <div className="flex w-11/12 shrink flex-row justify-around">
                    <div className="shrink w-full p-2 m-2 border-4 rounded-lg bg-white text-lg font-medium">
                        {Instructions}
                    </div>
                </div>
                <div className=" w-full h-full grow">
                    <div className="flex flex-row justify-around flex-wrap">
                        {race.results.map((element, index) => {
                            return (
                                <div key={index} className="duration-500 motion-safe:hover:scale-105 flex-col justify-center p-6 m-4 border-2 border-pink-500 rounded-lg shadow-xl cursor-pointer w-1/4 shrink-0">
                                    <h2 className="text-2xl text-gray-700">{element.SailNumber} - {element.boat.name}</h2>
                                    <p className="text-base text-gray-600">{element.Helm}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default RacePage