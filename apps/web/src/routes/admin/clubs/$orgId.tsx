import { createFileRoute } from '@tanstack/react-router'
import { title } from '@components/layout/home/primitaves'
import { Card, CardContent } from '@components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import MembersTable from '@components/tables/MembersTable'
import TeamsTable from '@components/tables/TeamsTable'
import CreateTeamModal from '@components/layout/dashboard/createTeamModal'
function Page() {
    const { orgId } = Route.useParams()

    const club = useQuery(orpcClient.organization.find.queryOptions({ input: { orgId: orgId } })).data
    const stripe = useQuery(orpcClient.stripe.org.queryOptions({ input: { orgId: orgId } })).data

    if (!club || !stripe) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1 className={title({ color: 'blue' })}>{club.name}</h1>
            <Card className='mb-8'>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                            <div className='mb-4 sm:mb-0'>
                                <p className='font-medium'>Current Plan: {stripe.planName || 'None'}</p>
                                <p className='text-sm text-muted-foreground'>
                                    {stripe.subscriptionStatus === 'active'
                                        ? 'Billed monthly'
                                        : stripe.subscriptionStatus === 'trialing'
                                          ? 'Trial period'
                                          : 'No active subscription'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div>
                <div className='text-2xl font-bold px-6 py-2'>Members</div>
                <MembersTable orgId={orgId!} />
                <div className='text-2xl font-bold px-6 py-2'>Teams</div>
                <TeamsTable orgId={orgId!} />
                <CreateTeamModal orgId={orgId!} />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/admin/clubs/$orgId')({
    component: Page
})
