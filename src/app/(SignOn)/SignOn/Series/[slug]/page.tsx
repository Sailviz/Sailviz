'use client'
import { useRouter } from 'next/navigation'
import SeriesResultsTable from '@/components/tables/SeriesResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { title } from '@/components/ui/home/primitaves'
import { useSession, signIn } from 'next-auth/react'

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(params.slug)

    console.log(series)
    if (clubIsValidating || seriesIsError || series == undefined || club == undefined || session == undefined) {
        return <PageSkeleton />
    }
    return (
        <div className='h-screen'>
            <div className='h-1/6 p-6'>
                <h1 className={title({ color: 'blue' })}>Series Results - {series.name} </h1>
                <p className='py-4 text-2xl font-bold'>
                    {' '}
                    Series of {series.races.length} races - {series.settings.numberToCount} to count
                </p>
            </div>
            <div className='h-5/6 p-6'>
                <SeriesResultsTable key={JSON.stringify(series)} data={series} />
            </div>
        </div>
    )
}
