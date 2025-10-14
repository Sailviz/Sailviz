import { useEffect, useState } from 'react'
import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Input } from '@components/ui/input'
import { Table, TableBody, TableCell, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { SaveButton } from '@components/ui/save-button'

export default function Page() {
    const session = useLoaderData({ from: `__root__` })

    const { data: club } = useQuery(orpcClient.club.session.queryOptions())

    const clubMutation = useMutation(orpcClient.club.update.mutationOptions())

    const [pursuitLength, setPursuitLength] = useState(0)

    useEffect(() => {
        if (club == undefined) return
        setPursuitLength(club.settings.pursuitLength)
    }, [club])

    const savePursuitLength = async (pursuitLength: number) => {
        if (club == undefined) {
            throw new Error('Club is undefined')
        }
        await clubMutation.mutateAsync({ ...club, settings: { ...club.settings, pursuitLength: pursuitLength } })
    }

    const addDuty = async () => {
        if (club == undefined) {
            throw new Error('Club is undefined')
        }
        await clubMutation.mutateAsync({ ...club, settings: { ...club.settings, duties: [...club.settings.duties, 'Duty'] } })
    }

    const editDuty = async (index: number, value: string) => {
        if (club == undefined) {
            throw new Error('Club is undefined')
        }
        let newDuties = club.settings.duties
        newDuties[index] = value
        await clubMutation.mutateAsync({ ...club, settings: { ...club.settings, duties: newDuties } })
    }

    useEffect(() => {
        if (club == undefined) return
        console.log(club)
        if (club.settings.pursuitLength == undefined) return
    }, [club])

    if (club == undefined || session == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <div className='flex flex-col'>
                <p className='text-2xl font-bold p-6'>Default Pursuit Race Length</p>
                <div className='flex flex-col px-6 w-full '>
                    <Input type='number' value={pursuitLength} onChange={e => setPursuitLength(parseInt(e.target.value))} />
                    <SaveButton onSave={() => savePursuitLength(pursuitLength)} />
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

export const Route = createFileRoute('/Dashboard/Club/')({
    component: Page
})
