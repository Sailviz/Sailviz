'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import { Input, Button } from "@nextui-org/react";
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";


export default function Page() {
    const Router = useRouter();

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()

    const [pursuitLength, setPursuitLength] = useState("")
    const [clockIP, setClockIP] = useState("")
    const [clockOffset, setClockOffset] = useState("")
    const [hornIP, setHornIP] = useState("")

    const saveClubSettings = async () => {
        console.log("ran")
        await DB.UpdateClubById({ ...club, settings: { pursuitLength: parseInt(pursuitLength), clockIP: clockIP, clockOffset: parseInt(clockOffset), hornIP: hornIP } })
    }

    useEffect(() => {
        if (club == undefined) return
        setPursuitLength(club.settings.pursuitLength.toString())
        setClockIP(club.settings.clockIP)
        setClockOffset(club.settings.clockOffset.toString())
        setHornIP(club.settings.hornIP)
    }, [club])

    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <>
                <p className='text-2xl font-bold p-6'>
                    Pursuit Race Length
                </p>
                <div className='flex flex-col px-6 w-full '>
                    <Input type="number"
                        value={pursuitLength}
                        onValueChange={setPursuitLength}
                    />
                </div>
                <p className='text-2xl font-bold p-6'>
                    Clock Config
                </p>
                <div className='flex flex-row px-6 w-full '>
                    <p className='text-2xl font-bold my-auto mx-4'>
                        IP Address
                    </p>
                    <Input type="text"
                        value={clockIP}
                        onValueChange={setClockIP}
                    />
                    <p className='text-2xl font-bold my-auto mx-4'>
                        Offset
                    </p>
                    <Input type="number"
                        value={clockOffset}
                        onValueChange={setClockOffset}
                    />
                </div>
                <p className='text-2xl font-bold p-6'>
                    Horn Config
                </p>
                <div className='flex flex-col px-6 w-full '>
                    <p className='text-2xl font-bold'>
                        IP Address
                    </p>
                    <Input type="text"
                        value={hornIP}
                        onValueChange={setHornIP}
                    />
                </div>
                <div className='flex flex-col p-6 w-full '>
                    <Button onClick={saveClubSettings} color='primary'>
                        Save
                    </Button>
                </div>
            </>
        )
    else return (
        <div>
            <p> These Settings are unavailable to you.</p>
        </div>
    )
}