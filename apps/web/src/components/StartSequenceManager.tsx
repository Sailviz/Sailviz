import { useEffect, useState } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { getFiveStartSequence, getThreeStartSequence } from './helpers/startSequence'
import type { StartSequenceStepType } from '@sailviz/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { ActionButton } from './ui/action-button'
const StartSequenceManager = ({ initialSequence, seriesId }: { initialSequence: StartSequenceStepType[]; seriesId: string }) => {
    const { data: series } = useQuery(orpcClient.series.find.queryOptions({ input: { seriesId: seriesId } }))

    const stepDeletion = useMutation(orpcClient.startSequence.delete.mutationOptions())
    const stepUpdate = useMutation(orpcClient.startSequence.update.mutationOptions())

    const [sequence, setSequence] = useState<StartSequenceStep[]>(initialSequence)

    const updateStep = (index: number, key: keyof StartSequenceStep, value: string | number | object) => {
        setSequence(prev => prev.map((step, i) => (i === index ? { ...step, [key]: value } : step)))
    }

    const updateStepOrder = (index: number, key: keyof StartSequenceStep, value: string | number | object) => {
        setSequence(prev => prev.map((step, i) => (i === index ? { ...step, [key]: value } : step)))
        //ensure sequence order is ordered by time
        setSequence(prev => {
            const ordered = [...prev].sort((a, b) => b.time - a.time)
            return ordered.map((step, i) => ({ ...step, order: i }))
        })
    }

    const moveStep = (index: number, direction: number) => {
        setSequence(prev => {
            const updated = [...prev]
            const [removed] = updated.splice(index, 1)
            if (removed !== undefined) {
                updated.splice(index + direction, 0, removed)
            }
            return updated
        })
    }

    const addStep = () => {
        if (sequence.length === 0) {
            setSequence([
                {
                    time: 5,
                    name: 'warning',
                    order: 0,
                    hoot: 0,
                    flagStatus: [],
                    fleetStart: ''
                }
            ])
        } else {
            setSequence([
                ...sequence,
                {
                    time: 0,
                    name: 'new-action',
                    order: sequence.length,
                    hoot: 0,
                    flagStatus: [],
                    fleetStart: ''
                }
            ])
        }
    }

    const deleteStep = (index: number) => {
        setSequence(prev => prev.filter((_, i) => i !== index))
        stepDeletion.mutateAsync({ stepId: sequence[index]!.id! })
    }

    const save = async () => {
        console.log('Saving sequence:', sequence)
        await stepUpdate.mutateAsync({ seriesId: seriesId, startSequence: sequence })
    }

    const setFiveSequence = () => {
        if (series?.fleetSettings[0] != undefined) {
            setSequence(getFiveStartSequence(series.fleetSettings[0].id))
        }
    }

    const setThreeSequence = () => {
        if (series?.fleetSettings[0] != undefined) {
            setSequence(getThreeStartSequence(series.fleetSettings[0].id))
        }
    }

    useEffect(() => {
        if (sequence != undefined) {
            console.log('Setting initial sequence:', initialSequence)
            setSequence(initialSequence)
        }
    }, [initialSequence])
    return (
        <div className=' mx-auto p-4 bg-gray-100 rounded-lg shadow-lg'>
            <h2 className='text-xl font-bold mb-4'>Start Sequence</h2>

            {sequence?.map((step, index) => (
                <div key={index} className='flex items-center gap-2 mb-2'>
                    <Input
                        type='number'
                        value={step.time}
                        onChange={e => updateStep(index, 'time', parseInt(e.target.value))}
                        onBlur={e => updateStepOrder(index, 'time', parseInt(e.target.value))}
                        className='border p-1 w-16'
                    />
                    <input type='text' value={step.name} onChange={e => updateStep(index, 'name', e.target.value)} className='border p-1 flex-grow' />
                    <input
                        type='number'
                        value={step.hoot}
                        onChange={e => updateStep(index, 'hoot', parseInt(e.target.value))}
                        className='border p-1 w-16'
                        placeholder='Hoot'
                    />
                    <select value={step.fleetStart} onChange={e => updateStep(index, 'fleetStart', e.target.value)} className='border p-1'>
                        <option value=''>Select Fleet</option>
                        {series?.fleetSettings?.map((fleet: any) => (
                            <option key={fleet.id} value={fleet.id}>
                                {fleet.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type='text'
                        defaultValue={step.flagStatus.map(flag => `${flag.flag}:${flag.status}`).join(', ')}
                        onChange={e => {
                            const flags = e.target.value.split(',').map(flag => {
                                const [flagName, status] = flag.split(':')
                                return { flag: flagName!.trim(), status: status?.trim() === 'true' }
                            })
                            updateStep(index, 'flagStatus', flags)
                        }}
                        className='border p-1 flex-grow'
                        placeholder='Flag Status (e.g., flag1:true, flag2:false)'
                    />
                    <button onClick={() => moveStep(index, -1)} disabled={index === 0}>
                        ↑
                    </button>
                    <button onClick={() => moveStep(index, 1)} disabled={index === sequence.length - 1}>
                        ↓
                    </button>
                    <button onClick={() => deleteStep(index)}>✖</button>
                </div>
            ))}

            <Button onClick={addStep} variant={'blue'} className='mx-4'>
                Add Step
            </Button>
            <ActionButton action={save} before='Save' during='Saving...' after='Saved' variant='blue' />

            <Button onClick={setFiveSequence} variant={'blue'} className='mx-4'>
                Set 5 4 1 GO
            </Button>
            <Button onClick={setThreeSequence} variant={'blue'} className='mx-4'>
                Set 3 2 1 GO
            </Button>
        </div>
    )
}

export default StartSequenceManager
