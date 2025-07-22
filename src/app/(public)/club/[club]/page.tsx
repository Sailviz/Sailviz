'use client'
import { use, useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import RacesTable from '@/components/tables/RacesTable'
import ClubTable from '@/components/tables/ClubTable'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { title, subtitle } from '@/components/layout/home/primitaves'
import cookie from 'js-cookie'

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

type PageProps = { params: Promise<{ club: string }> }

export default function Page(props: PageProps) {
    const router = useRouter()

    const { club: clubName } = use(props.params)
    const [club, setClub] = useState<ClubDataType>()

    var [series, setSeries] = useState<SeriesDataType[]>([])

    const viewSeries = (seriesId: string) => {
        router.push(clubName + '/Series/' + seriesId)
    }

    const viewRace = (raceId: string) => {
        router.push(clubName + '/Race/' + raceId)
    }

    useEffect(() => {
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
            <RacesTable clubId={club.id} date={new Date()} historical={true} viewHref={`/${clubName}/Race/`} />
            <div className='py-4'>
                <div className={title({ color: 'violet' })}>Series:</div>
            </div>
            <ClubTable viewHref={`/${clubName}/Series/`} />
        </div>
    )
}
