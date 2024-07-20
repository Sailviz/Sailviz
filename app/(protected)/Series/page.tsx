'use client'
import ClubTable from 'components/tables/ClubTable';
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';


export default function Page() {
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesByClubId(club)
    console.log(series)
    if (seriesIsValidating || seriesIsError || series == undefined) {
        return <PageSkeleton />
    }
    return (
        <div>
            <p className='text-2xl font-bold text-gray-700 p-6'>
                Series
            </p>
            <div className='p-6'>
                <ClubTable data={series} key={JSON.stringify(series)} deleteSeries={null} updateSeries={null} createSeries={null} />
            </div>
        </div>
    )
}