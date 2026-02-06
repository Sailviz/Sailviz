import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Select, { type CSSObjectWithLabel } from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function EditSignOnProfileModal({
    open,
    boats,
    profile,
    onClose
}: {
    open: boolean
    boats: Types.StandardBoatType[] | undefined
    profile: Types.SignOnProfile
    onClose: () => void
}) {
    const { theme } = useTheme()

    const updateProfileMutation = useMutation(orpcClient.user.signOnProfile.update.mutationOptions())
    const deleteProfileMutation = useMutation(orpcClient.user.signOnProfile.delete.mutationOptions())

    const queryClient = useQueryClient()

    const [boatOption, setBoatOption] = useState({ label: '', value: {} as Types.StandardBoatType })

    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [boat, setBoat] = useState<Types.StandardBoatType>({} as Types.StandardBoatType)
    const [sailNumber, setSailNumber] = useState('')

    let options: { label: string; value: Types.StandardBoatType }[] = []
    boats?.forEach((boat: Types.StandardBoatType) => {
        options.push({ value: boat as Types.StandardBoatType, label: boat.name })
    })

    const submit = async () => {
        await updateProfileMutation.mutateAsync({
            ...profile,
            Helm: helm,
            Crew: crew,
            Boat: boat,
            SailNumber: sailNumber
        })

        await queryClient.invalidateQueries({
            queryKey: orpcClient.user.signOnProfile.all.key({ type: 'query' })
        })

        onClose()
    }

    const onDelete = async (profile: Types.SignOnProfile) => {
        await deleteProfileMutation.mutateAsync(profile)
        onClose()
    }

    useEffect(() => {
        if (profile == undefined) {
            return
        }

        setHelm(profile.Helm)
        setCrew(profile.Crew)
        setBoat(profile.Boat)
        setBoatOption({ label: profile.Boat.name, value: profile.Boat })
        setSailNumber(profile.SailNumber)
    }, [profile])

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className='max-w-8/12' title='Edit Result'>
                <DialogHeader className='flex flex-col gap-1 text-2xl w-96'>Edit Profile</DialogHeader>
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
                    <Button color='danger' onClick={() => onDelete(profile!)}>
                        Remove
                    </Button>

                    <Button color='primary' onClick={submit}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
