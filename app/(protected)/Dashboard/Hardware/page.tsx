'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';


export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const saveClubSettings = (e: ChangeEvent<HTMLInputElement>) => {
        const tempdata = club
        // use e.target.id to update the correct field in the club data
        switch (e.target.id) {
            case 'pursuitLength':
                tempdata.settings.pursuitLength = parseInt(e.target.value)
                break
            case 'clockIP':
                tempdata.settings.clockIP = e.target.value
                break
            case 'clockOffset':
                tempdata.settings.clockOffset = parseInt(e.target.value)
                break
            case 'hornIP':
                tempdata.settings.hornIP = e.target.value
                break
        }
    }

    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <p className='text-2xl font-bold text-gray-700 p-6'>
                Pursuit Race Length
            </p>
            <div className='flex flex-col px-6 w-full '>
                <input type="text"
                    id='pursuitLength'
                    className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                    defaultValue={club?.settings?.pursuitLength}
                    onChange={saveClubSettings}
                    onBlur={() => DB.UpdateClubById(club)}
                />
            </div>
            <p className='text-2xl font-bold text-gray-700 p-6'>
                Clock Config
            </p>
            <div className='flex flex-row px-6 w-full '>
                <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                    IP Address
                </p>
                <input type="text"
                    id='clockIP'
                    className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                    defaultValue={club?.settings?.clockIP}
                    onChange={saveClubSettings}
                    onBlur={() => DB.UpdateClubById(club)}
                />
                <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                    Offset
                </p>
                <input type="text"
                    id='clockOffset'
                    className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                    defaultValue={club?.settings?.clockOffset}
                    onChange={saveClubSettings}
                    onBlur={() => DB.UpdateClubById(club)}
                />
            </div>
            <p className='text-2xl font-bold text-gray-700 p-6'>
                Horn Config
            </p>
            <div className='flex flex-col px-6 w-full '>
                <p className='text-2xl font-bold text-gray-700'>
                    IP Address
                </p>
                <input type="text"
                    id='hornIP'
                    className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                    defaultValue={club?.settings?.hornIP}
                    onChange={saveClubSettings}
                    onBlur={() => DB.UpdateClubById(club)}
                />
            </div>
        </>
    )
}