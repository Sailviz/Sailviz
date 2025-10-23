'use client'
import { use, useEffect, useState } from 'react'
import Layout from '@components/layout/Layout'
import { useNavigate } from '@tanstack/react-router'
import * as DB from '@components/apiMethods'
import * as Fetcher from '@components/Fetchers'
import RacesTable from '@components/tables/RacesTable'
import ClubTable from '@components/tables/ClubTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { title, subtitle } from '@components/layout/home/primitaves'
import cookie from 'js-cookie'
import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from '@components/ui/shadcn-io/banner'
import { CircleAlert } from 'lucide-react'
import { race } from 'cypress/types/bluebird'
import { Link } from '@tanstack/react-router'

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

type PageProps = { params: Promise<{ club: string }> }

function Page(props: PageProps) {
    const navigate = useNavigate()

    const { club: clubName } = use(props.params)
    const [club, setClub] = useState<ClubDataType>()

    const [showLiveBanner, setShowLiveBanner] = useState(false)

    const checkActive = (race: RaceDataType) => {
        if (race.fleets.length == 0) {
            console.error('no fleets found')
        }

        //if any fleets have been started
        if (race.fleets.some(fleet => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.fleets
                .flatMap(fleet => fleet.results)
                .every(result => {
                    if (result.finishTime != 0) {
                        return true
                    }
                })
        }
        return false
    }
    useEffect(() => {
        DB.getClubByName(clubName).then(data => {
            if (data) {
                setClub(data)
                DB.getTodaysRaceByClubId(data.id).then(races => {
                    if (races.length > 0) {
                        for (let i = 0; i < races.length; i++) {
                            DB.getRaceById(races[i]!.id).then(race => {
                                if (checkActive(race)) {
                                    setShowLiveBanner(true)
                                }
                            })
                        }
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
        <div className='p-4'>
            <Banner className='mb-4 bg-red-600' visible={showLiveBanner} onClose={() => setShowLiveBanner(false)}>
                <BannerIcon icon={CircleAlert} />
                <BannerTitle>View Live Race</BannerTitle>
                <Link to={'/club/' + clubName + '/LiveResults'}>
                    <BannerAction variant='outline'>Watch Now</BannerAction>
                </Link>
                <BannerClose />
            </Banner>
            <div className={title({ color: 'blue' }) + ' px-4'}>{club.displayName}</div>
            <div className='flex flex-row'>
                <div className='flex-col w-1/2 px-4'>
                    <div className='py-4'>
                        <div className={title({ color: 'blue' })}>Latest Races:</div>
                    </div>
                    <RacesTable clubId={club.id} date={new Date()} historical={true} viewHref={`/club/${clubName}/Race/`} />
                </div>
                <div className='flex-col w-1/2 px-4'>
                    <div className='py-4'>
                        <div className={title({ color: 'blue' })}>Latest Series:</div>
                    </div>
                    <ClubTable viewHref={`/club/${clubName}/Series/`} clubId={club.id} />
                </div>
            </div>
        </div>
    )
}
