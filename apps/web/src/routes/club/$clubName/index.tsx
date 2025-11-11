import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import RacesTable from '@components/tables/RacesTable'
import ClubTable from '@components/tables/ClubTable'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { title } from '@components/layout/home/primitaves'
import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from '@components/ui/shadcn-io/banner'
import { CircleAlert } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { ClubType, RaceType } from '@sailviz/types'
import HomeNav from '@components/layout/home/navbar'

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

function Page() {
    const { clubName } = Route.useParams()

    const club = useQuery(orpcClient.club.name.queryOptions({ input: { clubName: clubName! } })).data as ClubType

    const todaysRaces = useMutation(orpcClient.race.today.mutationOptions())
    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    const [showLiveBanner, setShowLiveBanner] = useState(false)

    const checkActive = (race: RaceType) => {
        if (race.fleets!.length == 0) {
            console.error('no fleets found')
        }

        //if any fleets have been started
        if (race.fleets!.some(fleet => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race
                .fleets!.flatMap(fleet => fleet.results)
                .every(result => {
                    if (result!.finishTime != 0 || result!.resultCode != '') {
                        return true
                    }
                })
        }
        return false
    }
    useEffect(() => {
        if (club == undefined) return
        todaysRaces.mutateAsync({ clubId: club.id }).then(races => {
            if (races.length > 0) {
                for (let i = 0; i < races.length; i++) {
                    findRaceMutation.mutateAsync({ raceId: races[i]!.id }).then(race => {
                        if (checkActive(race)) {
                            setShowLiveBanner(true)
                        }
                    })
                }
            }
        })
    }, [club])

    console.log(club)
    // list of current series
    //list of current races
    if (club == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            <HomeNav />
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
        </>
    )
}

export const Route = createFileRoute('/club/$clubName/')({
    component: Page
})
