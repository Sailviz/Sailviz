'use client'
import { use, useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'

import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import SeriesResultsTable from '@/components/tables/FleetSeriesResultsTable'
import { title, subtitle } from '@/components/layout/home/primitaves'

type PageProps = { params: Promise<{ slug: string; club: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()

    const params = use(props.params)
    const router = useRouter()

    var [clubId, setClubId] = useState<string>('invalid')
    var [series, setSeries] = useState<SeriesDataType>({
        id: '',
        name: '',
        clubId: '',
        settings: {
            numberToCount: 0,
            pursuitLength: 0
        },
        races: [],
        fleetSettings: [
            {
                id: '',
                name: '',
                boats: [],
                startDelay: 0,
                fleets: []
            } as FleetSettingsType
        ]
    })

    useEffect(() => {
        let seriesId = params.slug
        setClubId(params.club)
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
        <div className='p-6 panel-height w-full overflow-y-auto'>
            <div className='py-4'>
                <div className={title({ color: 'blue' })}>{series.name}</div>
            </div>
            {series?.fleetSettings.map((fleetSettings, index) => {
                return (
                    <>
                        <div>{fleetSettings.name}</div>
                        <SeriesResultsTable seriesId={series.id} fleetSettingsId={fleetSettings?.id} />
                    </>
                )
            })}
        </div>
    )
}
