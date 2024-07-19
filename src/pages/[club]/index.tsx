import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import * as DB from '../../components/apiMethods';
import { use } from "chai";
import { set } from "cypress/types/lodash";

const ClubPage = () => {
    const router = useRouter()

    var [clubId, setClubId] = useState<string>("invalid")
    var [races, setRaces] = useState<RaceDataType[]>([{
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
    }])
    var [series, setSeries] = useState<SeriesDataType[]>([{
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
    }])


    useEffect(() => {
        let clubName = router.query.club
        if (clubName) {
            DB.getClubByName(clubName.toString()).then((data) => {
                if (data) {
                    setClubId(data.id)
                } else {
                    console.log("could not find club")
                }
            })
        }
    }, [router])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }

            DB.GetSeriesByClubId(clubId).then((data) => {
                setSeries(data)
            })


            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                    }
                    console.log(racesCopy)
                    setRaces(racesCopy)
                    // let SeriesIds = racesCopy.flatMap(race => race.seriesId)
                    // let uniqueSeriesIds = [...new Set(SeriesIds)]
                    // let seriesCopy: SeriesDataType[] = []
                    // uniqueSeriesIds.forEach((id, i) => {
                    //     DB.GetSeriesById(id).then((data) => {
                    //         seriesCopy.push(data)
                    //     }
                    //     )
                    // }
                    // )
                    // console.log(seriesCopy)
                    // setSeries(seriesCopy)
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


    // list of current series
    //list of current races

    return (
        <Layout>
            <div className="flex flex-row mb-2 justify-center panel-height w-full overflow-y-auto">
                <div className='flex flex-col'>
                    <div className="mx-4">
                        <div className="text-xl font-extrabold text-gray-700 p-6">
                            Races:
                        </div>
                    </div>
                    {races.map((race, index) => {
                        return (
                            <div className="m-4" key={"race" + index}>
                                <p onClick={() => { router.push({ pathname: router.query.club + '/RaceResults', query: { id: race.id } }) }} className="p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                    {race.series.name}: {race.number}
                                </p>

                            </div>
                        )
                    })}
                </div>
                <div className='flex flex-col'>
                    <div className="mx-4">
                        <div className="text-xl font-extrabold text-gray-700 p-6">
                            Series:
                        </div>
                    </div>
                    {series.map((series, index) => {
                        return (
                            <div className="m-4" key={"series" + index}>
                                <p onClick={() => { router.push({ pathname: router.query.club + '/SeriesResults', query: { id: series.id } }) }} className="p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                    {series.name}
                                </p>

                            </div>
                        )
                    })}
                </div>
            </div>



        </Layout >
    );
}

export default ClubPage;