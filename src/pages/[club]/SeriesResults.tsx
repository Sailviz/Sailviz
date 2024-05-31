import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as DB from '../../components/apiMethods';
import LiveFleetResultsTable from "../../components/LiveFleetResultsTable";
import RaceTimer from "../../components/HRaceTimer"
import FleetResultsTable from "../../components/FleetResultsTable";
import SeriesResultsTable from "../../components/SeriesResultsTable";

const SeriesResults = () => {
    const router = useRouter()

    const query = router.query

    var [clubId, setClubId] = useState<string>("invalid")
    var [series, setSeries] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: [],
        fleetSettings: [{
            id: "",
            name: "",
            boats: [],
            startDelay: 0,
            fleets: []
        } as FleetSettingsType]
    })


    useEffect(() => {
        let seriesId = query.id as string
        setClubId(Cookies.get('clubId') || "")
        const getSeries = async () => {
            const seriesData = await DB.GetSeriesById(seriesId)
            setSeries(seriesData)
        }

        if (seriesId != undefined) {
            getSeries()
        }
    }, [router])

    // list of current series
    //list of 

    return (
        <Layout>
            <div className="m-6">
                <div className="text-4xl font-extrabold text-gray-700 p-6">
                    {series.name}
                </div>
                <SeriesResultsTable data={series} editable={false} showTime={false} key={JSON.stringify(series)} />
            </div>


        </Layout>
    );
}

export default SeriesResults;