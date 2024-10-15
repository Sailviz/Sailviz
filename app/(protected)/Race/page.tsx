'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import RacesTable from "components/tables/RacesTable";
import {title} from "../../../components/ui/home/primitaves";
import UpcomingRacesTable from "../../../components/tables/UpcomingRacesTable";


export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const viewRace = (raceId: string) => {
        Router.push('/Race/' + raceId)
    }

    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    return (
        <div>
            <div className="p-6">
                <h1 className={title({color: "blue"})}>Races</h1>
            </div>
            <div className="flex flex-row">
                <div className="px-3">
                    <p className='text-2xl font-bold p-6'>
                        Today
                    </p>
                    <UpcomingRacesTable club={club}/>
                </div>
                <div className="px-3">
                    <p className='text-2xl font-bold p-6'>
                        Upcoming
                    </p>
                    <RacesTable club={club} date={new Date()} historical={false} viewRace={viewRace}/>
                </div>
                <div className="px-3">
                    <p className='text-2xl font-bold p-6'>
                        Recent
                    </p>
                    <RacesTable club={club} date={new Date()} historical={true} viewRace={viewRace}/>
                </div>
            </div>
        </div>
    )
}