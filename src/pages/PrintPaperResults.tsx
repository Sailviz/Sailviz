import React, { ChangeEvent, MouseEventHandler, useEffect, useRef, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";

import { useReactToPrint } from "react-to-print";
import PaperResultsTable from "../components/PaperResultsTable";

const PrintPaperResults = () => {

    const router = useRouter()

    const query = router.query

    const [isLoading, setLoading] = useState(true)

    var [clubId, setClubId] = useState<string>("invalid")

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            pursuitLength: 0,
            hornIP: "",
            clockOffset: 0,
        },
        series: [],
        boats: [],
    })

    var [user, setUser] = useState<UserDataType>({
        id: "",
        displayName: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

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
                boat: {
                    py: 0,
                } as BoatDataType,
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

    const componentRef = useRef()

    const handlePrint = useReactToPrint({
        content: () => componentRef.current as any,
        onAfterPrint: () => {
            Router.back()
        }
    });

    useEffect(() => {
        let raceId = query.race as string
        setClubId(Cookies.get('clubId') || "")
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId)
            setRace(racedata)
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

            const fetchClub = async () => {
                var data = await DB.GetClubById(clubId)
                if (data) {
                    setClub(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchClub()

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
            setLoading(false)

        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])

    useEffect(() => {
        handlePrint()
    }, [race])
    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }
    return (
        <div className="h-full overflow-y-auto p-6">
            <PaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} ref={componentRef} />
        </div>
    )
}
export default PrintPaperResults