'use client'
import { title } from '@/components/layout/home/primitaves'
import * as fetcher from '@/components/Fetchers'
import { useSession } from '@/lib/auth-client'
import { use } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PageProps = { params: Promise<{ clubId: string }> }

export default function Page(props: PageProps) {
    const { clubId } = use(props.params)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    console.log('Session:', session)

    const { club, clubIsValidating, clubIsError } = fetcher.GetClubById(clubId || '')
    console.log('Club:', club)

    if (clubIsValidating || clubIsError || !club) {
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
                                <p className='font-medium'>Current Plan: {club.stripe?.planName || 'None'}</p>
                                <p className='text-sm text-muted-foreground'>
                                    {club.stripe?.subscriptionStatus === 'active'
                                        ? 'Billed monthly'
                                        : club.stripe?.subscriptionStatus === 'trialing'
                                        ? 'Trial period'
                                        : 'No active subscription'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
