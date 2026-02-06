import { useTheme } from 'next-themes'
import { type ChangeEvent, useState } from 'react'
import Select, { type CSSObjectWithLabel } from 'react-select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import * as Types from '@sailviz/types'

export default function CreateSignOnProfileModal({ boats }: { boats: Types.StandardBoatType[] | undefined }) {
    const createProfileMutation = useMutation(orpcClient.user.signOnProfile.create.mutationOptions())

    const [open, setOpen] = useState(false)
    const [helm, setHelm] = useState('')
    const [crew, setCrew] = useState('')
    const [sailNumber, setSailNumber] = useState('')

    const queryClient = useQueryClient()

    const { theme } = useTheme()
    let submitDisabled = false

    const [selectedBoat, setSelectedBoat] = useState({ label: '', value: {} as Types.StandardBoatType })

    const [helmError, setHelmError] = useState(false)
    const [boatError, setBoatError] = useState(false)
    const [sailNumError, setSailNumError] = useState(false)

    let options: { label: string; value: Types.StandardBoatType }[] = []

    //set the first boat as the selected boat
    if (boats && boats.length > 0) {
        boats.forEach((boat: Types.StandardBoatType) => {
            options.push({ value: boat as Types.StandardBoatType, label: boat.name })
        })
    }

    const CapitaliseInput = (e: ChangeEvent<HTMLInputElement>) => {
        const sentence = e.target.value.split(' ')
        const capitalizedWords = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1))
        const capitalisedSentence = capitalizedWords.join(' ')
        if (e.target.id == 'helm') setHelm(capitalisedSentence)
        if (e.target.id == 'crew') setCrew(capitalisedSentence)
    }

    const Submit = async () => {
        //don't process submission if it's disabled
        if (submitDisabled == true) return

        //check if all fields are filled in
        submitDisabled = true
        let error = false
        if (helm == '') {
            setHelmError(true)
            error = true
        }
        if (selectedBoat.label == '') {
            setBoatError(true)
            error = true
        }
        if (sailNumber == '') {
            setSailNumError(true)
            error = true
        }
        if (error) {
            return
        }
        createProfile(helm, crew, selectedBoat.value, sailNumber)
        setOpen(false)
    }

    const createProfile = async (helm: string, crew: string, boat: Types.StandardBoatType, sailNum: string) => {
        await createProfileMutation.mutateAsync({ Helm: helm, Crew: crew, boatId: boat.id, sailNumber: sailNum })
        await queryClient.invalidateQueries({
            queryKey: orpcClient.user.signOnProfile.all.key({ type: 'query' })
        })
    }

    const clearFields = async () => {
        console.log('clearing fields')
        setHelm('')
        setCrew('')
        setSailNumber('')
        setSelectedBoat({ label: '', value: {} as Types.BoatType })
        submitDisabled = false
    }

    return (
        <Dialog
            open={open}
            onOpenChange={e => {
                clearFields()
                setOpen(e)
            }}
        >
            <DialogTrigger asChild>
                <Button variant={'green'} size={'big'} aria-label='add entry'>
                    Create Profile
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-8/12'>
                <DialogHeader className='flex flex-col gap-1'>Create New Entry</DialogHeader>
                <div className='flex w-full'>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Helm</p>

                        <Input
                            id='helm'
                            type='text'
                            value={helm}
                            onChange={e => {
                                setHelmError(false)
                                CapitaliseInput(e)
                            }}
                            placeholder='J Bloggs'
                            autoComplete='off'
                            isInvalid={helmError}
                        />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Crew</p>
                        <Input id='crew' type='text' value={crew} onChange={CapitaliseInput} autoComplete='off' />
                    </div>
                    <div className='flex flex-col px-6 w-full'>
                        <p className='text-2xl font-bold'>Class</p>
                        <Select
                            id='Class'
                            className=' w-56 text-3xl'
                            options={options}
                            value={selectedBoat}
                            onChange={choice => {
                                setBoatError(false)
                                setSelectedBoat(choice!)
                            }}
                            styles={{
                                control: provided =>
                                    ({
                                        ...provided,
                                        border: boatError ? '2px solid #f31260' : 'none',
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
                        <Input
                            type='text'
                            id='SailNum'
                            autoComplete='off'
                            onChange={e => {
                                setSailNumError(false)
                                setSailNumber(e.target.value)
                            }}
                            isInvalid={sailNumError}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button color='success' onClick={Submit}>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
