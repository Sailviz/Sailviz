'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { mutate } from 'swr'
import { EditIcon } from '@/components/icons/edit-icon'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'

export default function Page() {
    const Router = useRouter()
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const savePursuitLength = async (pursuitLength: string) => {
        await DB.UpdateClubById({ ...club, settings: { ...club.settings, pursuitLength: parseInt(pursuitLength) } })
    }

    const addDuty = async () => {
        await DB.UpdateClubById({ ...club, settings: { ...club.settings, duties: [...club.settings.duties, 'Duty'] } })
        mutate('/api/club')
    }

    const editDuty = async (index: number, value: string) => {
        let newDuties = club.settings.duties
        newDuties[index] = value
        await DB.UpdateClubById({ ...club, settings: { ...club.settings, duties: newDuties } })
    }

    useEffect(() => {
        if (club == undefined) return
        console.log(club)
        if (club.settings.pursuitLength == undefined) return
    }, [club])

    if (clubIsValidating || clubIsError || club == undefined || session == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <div className='flex flex-col'>
                <p className='text-2xl font-bold p-6'>Pursuit Race Length</p>
                <div className='flex flex-col px-6 w-full '>
                    <Input type='number' defaultValue={club.settings.pursuitLength.toString()} onChange={e => savePursuitLength(e.target.value)} />
                </div>
                <p className='text-2xl font-bold p-6'>Duties</p>
                <Table>
                    <TableBody>
                        {club.settings.duties.map((row: string, index: number) => (
                            <TableRow key={row}>
                                <TableCell>
                                    <div className='grow justify-self-start'>
                                        <Input
                                            defaultValue={row}
                                            onBlur={(e: any) => {
                                                editDuty(index, e.target.value)
                                            }}
                                        ></Input>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <p className='text-2xl font-bold p-6'>
                    <Button onClick={addDuty}>Add Duty</Button>
                </p>
            </div>
        )
    else
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
}
