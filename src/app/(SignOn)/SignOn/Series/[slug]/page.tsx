'use client'
import { useRouter } from 'next/navigation'
import SeriesResultsTable from '@/components/tables/FleetSeriesResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { title } from '@/components/layout/home/primitaves'
import { use } from 'react'

type PageProps = { params: Promise<{ slug: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()

    const params = use(props.params)

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(params.slug)

    console.log(series)
    if (clubIsValidating || seriesIsError || series == undefined || club == undefined) {
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
                {series?.fleetSettings.map((fleetSettings, index) => {
                    return (
                        <>
                            <div>{fleetSettings.name}</div>
                            <SeriesResultsTable seriesId={series.id} fleetSettingsId={fleetSettings?.id} />
                        </>
                    )
                })}
            </div>
        </div>
    )
}
