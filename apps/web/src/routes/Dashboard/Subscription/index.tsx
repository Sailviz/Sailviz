import { PageSkeleton } from '@components/layout/PageSkeleton'
import { Button } from '@components/ui/button'
import { Card, CardContent } from '@components/ui/card'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@sailviz/auth/client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { Page as PricingPage } from 'src/routes/Pricing/page'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    if (!session.session.activeOrganizationId) {
        return <PageSkeleton />
    }

    const stripe = useQuery(orpcClient.stripe.org.queryOptions({ input: { orgId: session.session.activeOrganizationId } })).data

    if (stripe == undefined) {
        return <PageSkeleton />
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
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
                            {stripe.subscriptionStatus === 'active' && (
                                // TODO: Replace 'null' with actual manage subscription URL
                                <form action={'null'}>
                                    <Button type='submit' variant='outline'>
                                        Manage Subscription
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {stripe.subscriptionStatus !== 'active' && <PricingPage />}
        </div>
    )
}

export const Route = createFileRoute('/dashboard/Subscription/')({
    component: Page
})
