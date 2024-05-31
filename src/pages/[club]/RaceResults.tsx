import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../../components/apiMethods';
import LiveFleetResultsTable from "../../components/LiveFleetResultsTable";
import RaceTimer from "../../components/HRaceTimer"
import FleetResultsTable from "../../components/FleetResultsTable";

const ClubPage = () => {
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
            raceId: "",
            id: "",
            name: "",
            boats: [],
            startDelay: 0,
            results: [],
            startTime: 0,
            fleetSettings: {} as FleetSettingsType
        } as FleetDataType],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })
    var [seriesName, setSeriesName] = useState<string>("")


    useEffect(() => {
        let raceId = query.id as string
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
    }, [router])

    // list of current series
    //list of 

    return (
        <Layout>
            <div className="m-6 panel-height w-full overflow-y-auto" key={race.id}>
                <div className="text-4xl font-extrabold text-gray-700 p-6">
                    {race.series.name}: {race.number}
                </div>
                <FleetResultsTable data={race.fleets.flatMap(fleet => fleet.results)} startTime={race.fleets[0]?.startTime} editable={false} showTime={false} />
            </div>


        </Layout>
    );
}

export default ClubPage;