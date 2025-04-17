'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { mutate } from 'swr'
import { EditIcon } from '@/components/icons/edit-icon'

export default function Page() {
    const Router = useRouter()

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()

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

    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <>
                <p className='text-2xl font-bold p-6'>Pursuit Race Length</p>
                <div className='flex flex-col px-6 w-full '>
                    <Input type='number' defaultValue={club.settings.pursuitLength.toString()} onValueChange={savePursuitLength} />
                </div>
                <p className='text-2xl font-bold p-6'>Duties</p>
                <Table hideHeader>
                    <TableHeader>
                        {[{ key: 'main', label: 'nope' }].map(column => (
                            <TableColumn key={column.key}>{column.label}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {club.settings.duties.map((row: string, index: number) => (
                            <TableRow key={row}>
                                {columnKey => (
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
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <p className='text-2xl font-bold p-6'>
                    <Button onClick={addDuty}>Add Duty</Button>
                </p>
            </>
        )
    else
        return (
            <div>
                <p> These Settings are unavailable to you.</p>
            </div>
        )
}
