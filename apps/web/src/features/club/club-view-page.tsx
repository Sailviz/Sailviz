import { useEffect, useState } from 'react'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from '@components/ui/shadcn-io/banner'
import { CircleAlert } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import SeriesTable from '@features/series/series-table'
import { useSeriesTableFilters } from '@features/series/series-table/use-series-table-filters'
import RaceTable from '@features/race/race-table'
import { useRaceTableFilters } from '@features/race/race-table/use-race-table-filters'
import PageContainer from '@components/layout/page-container'
import { Heading } from '@components/ui/heading'
import { Separator } from '@components/ui/separator'

const ClubViewPage = ({ orgName }: { orgName: string }) => {
    const club = useQuery(orpcClient.organization.name.queryOptions({ input: { orgName: orgName! } })).data as Types.Org

    const todaysRaces = useMutation(orpcClient.race.today.mutationOptions())
    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    const [showLiveBanner, setShowLiveBanner] = useState(false)

    // Ensure hooks are called in a consistent order
    const raceTableFilters = useRaceTableFilters()
    const seriesTableFilters = useSeriesTableFilters()

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
        <PageContainer scrollable={false}>
            <Banner className='mb-4 bg-red-600' visible={showLiveBanner} onClose={() => setShowLiveBanner(false)}>
                <BannerIcon icon={CircleAlert} />
                <BannerTitle>View Live Race</BannerTitle>
                <Link to={'club/' + orgName + '/LiveResults'}>
                    <BannerAction variant='outline'>Watch Now</BannerAction>
                </Link>
                <BannerClose />
            </Banner>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title={orgName} description={'tag line'} />
                </div>
                <Separator />
                <div className='flex flex-row'>
                    <div className='flex-col w-1/2 px-4'>
                        <Heading title={'Races Today'} description={''} />
                        <UpcomingRacesTable orgId={club.id} viewHref={`Race/`} />
                    </div>
                </div>
                <div className='flex flex-row'>
                    <div className='flex-col w-1/2 px-4'>
                        <Heading title={'Latest Races'} description={''} />
                        <RaceTable historical={true} filters={raceTableFilters} date={new Date()} orgId={club.id} />
                    </div>
                    <div className='flex-col w-1/2 px-4'>
                        <Heading title={'Series'} description={''} />
                        <SeriesTable filters={seriesTableFilters} orgId={club.id} />
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}

export default ClubViewPage
