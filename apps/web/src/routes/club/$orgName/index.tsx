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
import HomeNav from '@components/layout/home/navbar'
import * as Types from '@sailviz/types'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

function Page() {
    const { orgName } = Route.useParams()

    const club = useQuery(orpcClient.organization.name.queryOptions({ input: { orgName: orgName! } })).data as Types.Org

    const todaysRaces = useMutation(orpcClient.race.today.mutationOptions())
    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    const [showLiveBanner, setShowLiveBanner] = useState(false)

    const checkActive = (race: Types.RaceType) => {
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
        todaysRaces.mutateAsync({ orgId: club.id }).then(races => {
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
                <Link to={'/club/' + orgName + '/LiveResults'}>
                    <BannerAction variant='outline'>Watch Now</BannerAction>
                </Link>
                <BannerClose />
            </Banner>
            <div className={title({ color: 'blue' }) + ' px-4'}>{club.name}</div>
            <div className='flex flex-row'>
                <div className='flex-col w-1/2 px-4'>
                    <div className='py-4'>
                        <div className={title({ color: 'blue' })}>Races Today:</div>
                    </div>
                    <UpcomingRacesTable orgId={club.id} viewHref={`/club/${orgName}/Race/`} />
                </div>
                <div className='flex-col w-1/2 px-4'>
                    <div className='py-4'>
                        <div className={title({ color: 'blue' })}>Latest Races:</div>
                    </div>
                    <RacesTable orgId={club.id} date={new Date()} historical={true} viewHref={`/club/${orgName}/Race/`} />
                </div>
                <div className='flex-col w-1/2 px-4'>
                    <div className='py-4'>
                        <div className={title({ color: 'blue' })}>Latest Series:</div>
                    </div>
                    <ClubTable viewHref={`/club/${orgName}/Series/`} orgId={club.id} />
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/club/$orgName/')({
    component: Page
})
