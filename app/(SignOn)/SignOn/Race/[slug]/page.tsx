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
    if (userIsValidating || clubIsValidating || user == undefined || club == undefined) {
        return (
            <PageSkeleton />
        )
    }
    return (

        <div className="py-4 w-full">
            {race.fleets.map((fleet, index) => {
                return (
                    <div key={"fleetResults" + index}>
                        <p className='text-2xl font-bol'>
                            {fleet.fleetSettings.name} - Boats Entered: {fleet.results.length}
                        </p>
                        {race.Type == "Handicap" ?
                            <FleetHandicapResultsTable showTime={true} editable={false} fleetId={fleet.id} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={null} updateResult={null} raceId={race.id} showEditModal={null} />
                            :
                            <FleetPursuitResultsTable showTime={true} editable={false} fleetId={fleet.id} startTime={fleet.startTime} key={JSON.stringify(race)} deleteResult={null} updateResult={null} raceId={race.id} showEditModal={null} />
                        }

                    </div>
                )
            })}
        </div>

    )
}