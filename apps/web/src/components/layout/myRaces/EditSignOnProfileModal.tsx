import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Select, { type CSSObjectWithLabel } from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function EditSignOnProfileModal({
    open,
    profile,
    advancedEdit,
    onClose
}: {
    open: boolean
    profile: Types.SignOnProfile | undefined
    advancedEdit: boolean
    onClose: () => void
}) {
    const { theme } = useTheme()
    const boats = useQuery(orpcClient.boat.session.queryOptions()).data as Types.BoatType[]

    const updateProfileMutation = useMutation(orpcClient.user.profile.update.mutationOptions())
    const deleteProfileMutation = useMutation(orpcClient.user.profile.delete.mutationOptions())

    const queryClient = useQueryClient()

    const [boatOption, setBoatOption] = useState({ label: '', value: {} as Types.BoatType })

    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [boat, setBoat] = useState<Types.BoatType>({} as Types.BoatType)
    const [sailNumber, setSailNumber] = useState('')

    let options: { label: string; value: Types.BoatType }[] = []
    boats?.forEach((boat: Types.BoatType) => {
        options.push({ value: boat as Types.BoatType, label: boat.name })
    })

    const submit = async () => {
        await updateProfileMutation.mutateAsync({
            Helm: helm,
            Crew: crew,
            boat: boat,
            SailNumber: sailNumber
        })

        await queryClient.invalidateQueries({
            queryKey: orpcClient.fleet.find.key({ type: 'query', input: { fleetId: fleet!.id } })
        })

        onClose()
    }

    const onDelete = async (profile: Types.Profile) => {
        await deleteProfileMutation.mutateAsync({ id: profile.id })
        onClose()
    }

    useEffect(() => {
        if (profile == undefined) {
            return
        }

        setHelm(profile.Helm)
        setCrew(profile.Crew)
        setBoat(profile.Boat)
        setSailNumber(profile.SailNumber)
    }, [profile])

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className='max-w-8/12' title='Edit Result'>
                <DialogHeader className='flex flex-col gap-1 text-2xl w-96'>Edit Result</DialogHeader>
                <div className='flex flex-col w-full'>
                    <div className='flex flex-row w-full'>
                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Helm</p>

                            <Input type='text' value={helm} onChange={e => setHelm(e.target.value)} />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Crew</p>

                            <Input type='text' value={crew} onChange={e => setCrew(e.target.value)} placeholder=' ' />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Class</p>

                            <Select
                                id='Class'
                                className=' w-56 h-full text-3xl'
                                options={options}
                                value={boatOption}
                                onChange={choice => {
                                    setBoatOption(choice!)
                                    setBoat(choice!.value)
                                }}
                                styles={{
                                    control: provided =>
                                        ({
                                            ...provided,
                                            border: 'none',
                                            padding: '0.5rem',
                                            fontSize: '1rem',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            backgroundColor: theme == 'dark' ? '#27272a' : '#f4f4f5',
                                            '&:hover': {
                                                backgroundColor: theme == 'dark' ? '#3f3f46' : '#e4e4e7'
                                            }
                                        }) as CSSObjectWithLabel,
                                    option: (provided, state) =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black',
                                            backgroundColor: theme == 'dark' ? (state.isSelected ? '#27272a' : '#18181b') : state.isSelected ? '#f4f4f5' : 'white',
                                            '&:hover': {
                                                backgroundColor: theme == 'dark' ? '#3f3f46' : '#d4d4d8'
                                            }
                                        }) as CSSObjectWithLabel,
                                    menu: provided =>
                                        ({
                                            ...provided,
                                            backgroundColor: theme == 'dark' ? '#18181b' : 'white',
                                            border: theme == 'dark' ? '2px solid #3f3f46' : '2px solid #d4d4d8',
                                            fontSize: '1rem'
                                        }) as CSSObjectWithLabel,
                                    input: provided =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black'
                                        }) as CSSObjectWithLabel,
                                    singleValue: provided =>
                                        ({
                                            ...provided,
                                            color: theme == 'dark' ? 'white' : 'black'
                                        }) as CSSObjectWithLabel
                                }}
                            />
                        </div>

                        <div className='flex flex-col px-6 w-full'>
                            <p className='text-2xl font-bold'>Sail Number</p>

                            <Input type='text' value={sailNumber} onChange={e => setSailNumber(e.target.value)} placeholder=' ' />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    {advancedEdit ? (
                        <Button color='danger' onClick={() => onDelete(profile!)}>
                            Remove
                        </Button>
                    ) : (
                        <></>
                    )}
                    <Button color='primary' onClick={submit}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
