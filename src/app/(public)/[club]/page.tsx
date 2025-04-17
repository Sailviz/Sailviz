'use client'
import { useEffect, useState } from 'react'
import Layout from '../../../components/ui/Layout'
import { useRouter } from 'next/navigation'
import * as DB from '../../../components/apiMethods'
import * as Fetcher from '../../../components/Fetchers'
import RacesTable from '@/components/tables/RacesTable'
import ClubTable from '@/components/tables/ClubTable'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { title, subtitle } from '@/components/ui/home/primitaves'
import cookie from 'js-cookie'

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

export default function Page({ params }: { params: { club: string } }) {
    const router = useRouter()

    var [club, setClub] = useState<ClubDataType>()
    var [series, setSeries] = useState<SeriesDataType[]>([])

    const viewSeries = (seriesId: string) => {
        router.push(params.club + '/Series/' + seriesId)
    }

    const viewRace = (raceId: string) => {
        router.push(params.club + '/Race/' + raceId)
    }

    useEffect(() => {
        let clubName = params.club
        DB.getClubByName(clubName).then(data => {
            if (data) {
                setClub(data)
                cookie.set('clubId', data.id, { expires: 2 })
                DB.GetSeriesByClubId(data.id).then(seriesData => {
                    if (seriesData) {
                        setSeries(seriesData)
                    }
                })
            } else {
                console.log('could not find club')
                //need to show a club not found page
            }
        })
    }, [])

    console.log(club)
    // list of current series
    //list of current races
    if (club == undefined) {
        return <PageSkeleton />
    }

    return (
        <div className='flex flex-col px-6'>
            <div className='py-4'>
                <div className={title({ color: 'green' })}>{club.displayName}</div>
            </div>
            <div className='py-4'>
                <div className={title({ color: 'blue' })}>Recent Races:</div>
            </div>
            <RacesTable club={club} date={new Date()} historical={true} viewRace={(raceId: string) => viewRace(raceId)} />
            <div className='py-4'>
                <div className={title({ color: 'violet' })}>Series:</div>
            </div>
            <ClubTable data={series} key={JSON.stringify(series)} deleteSeries={null} editSeries={null} viewSeries={(seriesId: string) => viewSeries(seriesId)} />
        </div>
    )
}
