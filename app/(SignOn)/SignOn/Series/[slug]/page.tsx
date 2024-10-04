"use client"
import { useRouter } from "next/navigation"
import SeriesResultsTable from "components/tables/SeriesResultsTable";
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from "components/ui/PageSkeleton";
import { title } from "components/ui/home/primitaves";
import ClubTable from "../../../../../components/tables/ClubTable";

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
        <div className="h-screen">
            <div className="h-1/6 p-6">
                <h1 className={title({color: "blue"})}>Series Results - {series.name} </h1>
            </div>
            <div className="h-5/6">
                <SeriesResultsTable key={JSON.stringify(series)} data={series}/>
            </div>
        </div>
    )
}