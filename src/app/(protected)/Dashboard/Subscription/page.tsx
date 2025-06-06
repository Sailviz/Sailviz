'use client'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { customerPortalAction } from '@/lib/payments/actions'
import PricingPage from '@/app/(public)/Pricing/page'

export default function Page() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    if (clubIsValidating || clubIsError || session == undefined) {
        return <PageSkeleton />
    }
    console.log('Club:', club)
    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <Card className='mb-8'>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                            <div className='mb-4 sm:mb-0'>
                                <p className='font-medium'>Current Plan: {club.stripe?.planName || 'None'}</p>
                                <p className='text-sm text-muted-foreground'>
                                    {club.stripe?.subscriptionStatus === 'active'
                                        ? 'Billed monthly'
                                        : club.stripe?.subscriptionStatus === 'trialing'
                                        ? 'Trial period'
                                        : 'No active subscription'}
                                </p>
                            </div>
                            {club.stripe?.subscriptionStatus === 'active' && (
                                <form action={customerPortalAction}>
                                    <Button type='submit' variant='outline'>
                                        Manage Subscription
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {club.stripe.subscriptionStatus !== 'active' && <PricingPage />}
        </div>
    )
}
