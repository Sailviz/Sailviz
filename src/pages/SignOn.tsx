import React, { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";
import SignOnTable from "../components/SignOnTable";

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

    var [user, setUser] = useState<UserDataType>({
        id: "",
        name: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    const [seriesData, setSeriesData] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: []
    })

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

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
            boat: {
                id: "",
                name: "",
                crew: 0,
                py: 0,
                clubId: "",
            },
            SailNumber: 0,
            finishTime: 0,
            CorrectedTime: 0,
            lapTimes: {
                times: []
            },
            Position: 0,
        }],
        Type: "",
        startTime: 0,
        seriesId: ""

    }))

    const createResult = async (id: string) => {
        console.log(race)
        const entry = await DB.createResult(id)
        setRace({ ...race, results: race.results.concat(entry) })
        return entry
    }

    const updateResult = async (result: ResultsDataType) => {
        console.log(result)

        await DB.updateResult(result)
        var data = await DB.getRaceById(race.id)
        console.log(race)
        console.log(data)
        setRace(data.race)
    }

    const deleteResult = async (resultId: string) => {
        await DB.DeleteResultById(resultId)
        var data = await DB.getRaceById(race.id)
        setSeriesData(data.race)
    }


    useEffect(() => {
        let raceId = query.race as string
        setClubId(Cookies.get('clubId') || "")
        const getRace = async () => {
            await DB.getRaceById(raceId).then((data: RaceDataType) => {
                setRace(data.race)
                DB.GetSeriesById(data.race.seriesId).then((data: SeriesDataType) => {
                    console.log(data)
                    setSeriesData(data)
                    setClubId(data.clubId)
                })

            })
        }

        if (raceId != undefined) {
            getRace()

        }
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
                } else {
                    console.log("could not find boats")
                }

            }
            fetchBoats()

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])


    return (
        <div>
            <div className="text-6xl font-extrabold text-gray-700 p-6">
                {seriesData.name}: {race.number} at {race.Time}
            </div>
            <div className="m-6">
                <SignOnTable data={race.results} startTime={race.startTime} key={race.id} deleteResult={deleteResult} updateResult={updateResult} createResult={createResult} clubId={clubId} raceId={race.id} />
            </div>
        </div>
    )
}

export default SignOnPage