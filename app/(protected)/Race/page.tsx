'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import RacesTable from "components/tables/RacesTable";


export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()


    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    return (
        <div>
            <p className='text-2xl font-bold p-6'>
                Races
            </p>
            <RacesTable club={club} />
        </div>
    )
}