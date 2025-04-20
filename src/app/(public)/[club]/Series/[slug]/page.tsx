'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/ui/Layout'

import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import SeriesResultsTable from '@/components/tables/SeriesResultsTable'
import { title, subtitle } from '@/components/ui/home/primitaves'

export default function Page({ params }: { params: { slug: string; club: string } }) {
    const router = useRouter()

    var [clubId, setClubId] = useState<string>('invalid')
    var [series, setSeries] = useState<SeriesDataType>({
        id: '',
        name: '',
        clubId: '',
        settings: {
            numberToCount: 0
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
            <SeriesResultsTable data={series} editable={false} showTime={false} key={JSON.stringify(series)} />
        </div>
    )
}
