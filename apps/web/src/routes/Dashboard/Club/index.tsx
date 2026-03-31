import { useEffect, useState } from 'react'
import { useLoaderData, createFileRoute } from '@tanstack/react-router'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { Input } from '@components/ui/input'
import { Table, TableBody, TableCell, TableRow } from '@components/ui/table'
import { Button } from '@components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActionButton } from '@components/ui/action-button'
import type { Session } from '@sailviz/auth/client'
import * as Types from '@sailviz/types'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const queryClient = useQueryClient()
    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())

    const orgDataMutation = useMutation(orpcClient.organization.orgData.update.mutationOptions())
    const createDutyMutation = useMutation(orpcClient.organization.duties.create.mutationOptions())
    const updateDutyMutation = useMutation(orpcClient.organization.duties.update.mutationOptions())

    const [pursuitLength, setPursuitLength] = useState(0)

    useEffect(() => {
        if (org == undefined) return
        setPursuitLength(org.orgData!.defaultPursuitLength)
    }, [org])

    const savePursuitLength = async (pursuitLength: number) => {
        if (org == undefined) {
            throw new Error('Club is undefined')
        }
        await orgDataMutation.mutateAsync({ ...org.orgData!, defaultPursuitLength: pursuitLength })
    }

    const addDuty = async () => {
        if (org == undefined) {
            throw new Error('Club is undefined')
        }
        await createDutyMutation.mutateAsync({})
        await queryClient.invalidateQueries({
            queryKey: orpcClient.organization.session.key({ type: 'query' })
        })
    }

    const editDuty = async (duty: Types.DutyType, value: string) => {
        await updateDutyMutation.mutateAsync({ ...duty, name: value })
    }

    if (org == undefined || session == undefined) {
        return <PageSkeleton />
    }
    console.log(org)
    if (userHasPermission(session.user, AVAILABLE_PERMISSIONS.editHardware))
        return (
            <div className='flex flex-col'>
                <p className='text-2xl font-bold p-6'>Default Pursuit Race Length</p>
                <div className='flex flex-col px-6 w-full '>
                    <Input type='number' value={pursuitLength} onChange={e => setPursuitLength(parseInt(e.target.value))} />
                    <ActionButton action={() => savePursuitLength(pursuitLength)} before='Save' during='Saving...' after='Saved' />
                </div>
                <p className='text-2xl font-bold p-6'>Duties</p>
                <Table>
                    <TableBody>
                        {org.orgData!.duties?.map((row: Types.DutyType) => (
                            <TableRow key={row}>
                                <TableCell>
                                    <div className='grow justify-self-start'>
                                        <Input
                                            defaultValue={row.name}
                                            onBlur={(e: any) => {
                                                editDuty(row, e.target.value)
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
