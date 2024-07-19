import React, { ChangeEvent, MouseEventHandler, useEffect, useRef, useState } from "react"
import Router, { useRouter } from "next/router"
import * as DB from '../components/apiMethods';
import Cookies from "js-cookie";

import { useReactToPrint } from "react-to-print";
import PaperResultsTable from "../components/HandicapPaperResultsTable";
import HandicapPaperResultsTable from "../components/HandicapPaperResultsTable";
import PursuitPaperResultsTable from "../components/PursuitPaperResultsTable";

const PrintPaperResults = () => {

    const router = useRouter()

    const query = router.query

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
                    pursuitStartTime: 0,
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
        Type: "Handicap",
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
        const getRace = async () => {
            const racedata = await DB.getRaceById(raceId)
            setRace(racedata)
        }

        if (raceId != undefined) {
            getRace()
        }

    }, [router])

    useEffect(() => {
        handlePrint()
    }, [race])

    return (
        <div className="h-full overflow-y-auto p-6">
            {race.Type == "Handicap" ?
                <HandicapPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} ref={componentRef} />
                :
                <PursuitPaperResultsTable results={race.fleets.flatMap(fleet => fleet.results)} key={JSON.stringify(race)} ref={componentRef} />
            }
        </div>
    )
}
export default PrintPaperResults