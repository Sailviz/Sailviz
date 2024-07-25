'use client'
import ClubTable from 'components/tables/ClubTable';
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import { useRouter } from 'next/navigation';


export default function Page() {
    const Router = useRouter();
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesByClubId(club)


    const viewSeries = (seriesId: string) => {
        Router.push('/Series/' + seriesId)
    }



    if (seriesIsValidating || seriesIsError || series == undefined) {
        return <PageSkeleton />
    }
    return (
        <div>
            <p className='text-2xl font-bold p-6'>
                Series
            </p>
            <div className='p-6'>
                <ClubTable data={series} key={JSON.stringify(series)} deleteSeries={null} editSeries={null} viewSeries={(seriesId: string) => viewSeries(seriesId)} />
            </div>
        </div>
    )
}