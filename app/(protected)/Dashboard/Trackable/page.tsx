'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import { Input, Button } from "@nextui-org/react";
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";
import {title} from "../../../../components/ui/home/primitaves";
import TrackerTable from "../../../../components/tables/TrackerTable";


export default function Page() {
    const Router = useRouter();

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()


    const trackerInfo = async (id: string) => {

    }


    if (clubIsValidating || clubIsError || userIsValidating || userIsError || user == undefined) {
        return <PageSkeleton />
    }

    if (!club.settings.trackable.enabled) {
        return (
            <div>
                <p>Trackable is not enabled for your club, contact support for more information</p>
            </div>
        )
    }

    if (!userHasPermission(user, AVAILABLE_PERMISSIONS.trackableView)) {
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
    }

    return (
        <>
            <div className="p-6">
            <h1 className={title({color: "blue"})}>Trackable Settings</h1>
                </div>
                <p className='text-2xl font-bold px-6 py-2'>
                    Trackers
                </p>
                <div className='flex flex-row items-center px-6 py-2 w-1/2 justify-around'>
                    <Button className="mx-1" color='primary' fullWidth>
                            Sync Trackers
                        </Button>
                </div>
                <div className='text-2xl font-bold px-6 py-2'>
                    <TrackerTable/>
                </div>
            </>
        )
}