import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import ClubTable from '@components/tables/ClubTable'
import CreateSeriesModal from '@components/layout/dashboard/CreateSeriesModal'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

function Page() {
    const session = useLoaderData({ from: `__root__` })

    const queryClient = useQueryClient()

    const seriesCreation = useMutation(orpcClient.series.create.mutationOptions())

    const [allowCreate, setAllowCreate] = useState(false)

    const createSeries = async (seriesName: string) => {
        if (!session.club) {
            throw new Error('No club found')
        }
        await seriesCreation.mutateAsync({
            name: seriesName,
            clubId: session.club.id
        })
        queryClient.invalidateQueries({
            queryKey: orpcClient.series.club.key({ type: 'query' })
        })
    }

    useEffect(() => {
        const checkSubscription = async () => {
            console.log('Session:', session)
            if (session?.club?.stripe.subscriptionStatus !== 'active') {
                //check how many series the user has
                let { data: series } = useQuery(orpcClient.series.club.queryOptions({ input: { clubId: session?.user?.clubId!, includeRaces: false } }))
                if (series == undefined) {
                    series = []
                }
                setAllowCreate(series.length == 0)

                // if not active, only allow a single series to be created
            } else {
                //if the user has an active subscription, allow them to create multiple series
                setAllowCreate(true)
            }
        }
        checkSubscription()
    }, [session])

    if (!session || !session.club) {
        return <PageSkeleton />
    }

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Series</h1>
            </div>
            {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <div className='p-6'>
                    <CreateSeriesModal onSubmit={createSeries} allowCreate={allowCreate} />
                </div>
            ) : (
                <></>
            )}
            <div className='p-6'>
                <ClubTable viewHref='/Dashboard/Series/' />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/Dashboard/Series/')({
    component: Page
})
