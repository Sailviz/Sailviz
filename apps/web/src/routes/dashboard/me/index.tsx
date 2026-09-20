import type { Session } from '@lib/session'
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router'
import UpcomingRacesTable from '@components/tables/UpcomingRacesTable'
import CreateResultModal from '@components/layout/myRaces/CreateResultModal'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'
import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from '@components/ui/shadcn-io/banner'
import { CircleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageContainer from '@components/layout/page-container'
import { ActivityFeed } from '@features/activities/ActivityFeed'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const favouriteOrgs = useQuery(orpcClient.user.favouriteOrgs.queryOptions()).data as Types.userFavouriteOrgsType[]
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
        if (favouriteOrgs == undefined) return
        favouriteOrgs?.forEach((org: any) => {
            todaysRaces.mutateAsync({ orgId: org.orgId }).then(races => {
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
        })
    }, [favouriteOrgs])

    if (favouriteOrgs == undefined) {
        return <div>Loading...</div>
    }

    function OrgSection(org: any) {
        const { data: todaysRaces } = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: org.id } }))

        if (!todaysRaces) return null

        return (
            <div>
                <h1>{org.organization.name}</h1>
                <UpcomingRacesTable orgId={org.orgId} viewHref={`/club/${org.organization.name}/Race/`} />
                <CreateResultModal org={org.organization} />
            </div>
        )
    }

    return (
        <PageContainer scrollable={true}>
            <div className='flex flex-1 flex-col space-y-4'>
                <Banner className='mb-4 bg-red-600' visible={showLiveBanner} onClose={() => setShowLiveBanner(false)}>
                    <BannerIcon icon={CircleAlert} />
                    <BannerTitle>View Live Race</BannerTitle>
                    <Link to={'/club/' + favouriteOrgs[0].organization.name + '/LiveResults'}>
                        <BannerAction variant='outline'>Watch Now</BannerAction>
                    </Link>
                    <BannerClose />
                </Banner>
                Hello {session?.user.name}
                {favouriteOrgs?.map((org: any) => {
                    ;<OrgSection key={org.orgId} org={org} />
                })}
                {/* infinite scrolling history of activities for user and people they follow */}
                <ActivityFeed userId={session.user.id} />
            </div>
        </PageContainer>
    )
}

export const Route = createFileRoute('/Dashboard/me/')({
    component: Page
})
