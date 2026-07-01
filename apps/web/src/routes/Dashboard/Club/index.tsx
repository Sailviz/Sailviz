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
import { ImageCategory, ImageUpload, OwnerType } from '@components/ImageUpload'
import Select from 'react-select'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    const queryClient = useQueryClient()
    const { data: org } = useQuery(orpcClient.organization.session.queryOptions())
    const { data: flags } = useQuery(orpcClient.flag.org.all.queryOptions())

    const orgDataMutation = useMutation(orpcClient.organization.orgData.update.mutationOptions())
    const createDutyMutation = useMutation(orpcClient.organization.duties.create.mutationOptions())
    const updateDutyMutation = useMutation(orpcClient.organization.duties.update.mutationOptions())

    const [pursuitLength, setPursuitLength] = useState(0)
    const [flagOptions, setFlagOptions] = useState([{ label: '', value: {} as Types.Flag }])
    const [selectedClassFlag, setSelectedClassFlag] = useState({ label: '', value: {} as Types.Flag })
    const [selectedPreparatoryFlag, setSelectedPreparatoryFlag] = useState({ label: '', value: {} as Types.Flag })

    const ClassFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: selectedClassFlag.value.s3key }, enabled: selectedClassFlag.label !== '' })
    })

    const PrepFlagUrlQuery = useQuery({
        ...orpcClient.image.getURL.queryOptions({ input: { s3key: selectedPreparatoryFlag.value.s3key }, enabled: selectedPreparatoryFlag.label !== '' })
    })

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

    useEffect(() => {
        if (org == undefined || org.orgData == undefined) return

        setSelectedClassFlag({ value: org.orgData.defaultClassFlag, label: org.orgData.defaultClassFlag.name })
        setSelectedPreparatoryFlag({ value: org.orgData.defaultPreparatoryFlag, label: org.orgData.defaultPreparatoryFlag.name })
    }, [org])

    useEffect(() => {
        if (flags === undefined) return
        let tempoptions: { label: string; value: Types.Flag }[] = []
        flags.forEach(boat => {
            // Check if the boat is already selected
            tempoptions.push({ value: boat as Types.Flag, label: boat.name })
        })
        setFlagOptions(tempoptions)
    }, [flags])

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
                <ImageUpload buttonText='upload Banner' owner={OwnerType.organization} category={ImageCategory.Banner} s3key={() => {}} />
                <div className='flex flex-row p-6'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Class</p>
                        <div className='w-full p-2 mx-0 my-2 flex flex-row'>
                            <Select
                                id='editClass'
                                className=' w-full h-full text-3xl'
                                options={flagOptions}
                                isMulti={false}
                                isClearable={false}
                                value={selectedClassFlag}
                                onChange={choice => setSelectedClassFlag(choice!)}
                            />
                        </div>
                    </div>
                    <img src={ClassFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Prep</p>
                        <div className='w-full p-2 mx-0 my-2 flex flex-row'>
                            <Select
                                id='editPrep'
                                className=' w-full h-full text-3xl'
                                options={flagOptions}
                                isMulti={false}
                                isClearable={false}
                                value={selectedPreparatoryFlag}
                                onChange={choice => setSelectedPreparatoryFlag(choice!)}
                            />
                        </div>
                    </div>
                    <img src={PrepFlagUrlQuery.data} alt='' width={200} height={200} className='border-2'></img>
                </div>
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
