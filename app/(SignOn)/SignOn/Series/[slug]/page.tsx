"use client"
import { useRouter } from "next/navigation"
import SeriesResultsTable from "components/tables/SeriesResultsTable";
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from "components/ui/PageSkeleton";

export default function Page({ params }: { params: { slug: string } }) {
    const Router = useRouter();
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(params.slug)

    console.log(series)
    if (userIsValidating || clubIsValidating || seriesIsError || series == undefined || club == undefined || user == undefined) {
        return (
            <PageSkeleton />
        )
    }
    return (
        <>
            <p className="text-6xl font-extrabold p-6">
                {series.name} Series Results
            </p>

            <div className="mb-6">
                <SeriesResultsTable key={JSON.stringify(series)} data={series} />
            </div>
        </>
    )
}