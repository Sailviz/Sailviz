import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import * as DB from './apiMethods'
import * as Fetcher from './Fetchers'
import { Select } from './ui/select'
import { Input } from './ui/input'
import { Inder } from 'next/font/google'
const StartSequenceManager = ({ initialSequence, seriesId }: { initialSequence: StartSequenceStep[]; seriesId: string }) => {
    const { series, seriesIsError, seriesIsValidating } = Fetcher.Series(seriesId)
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
        DB.deleteStartSequenceById(sequence[index]!.id!)
    }

    const save = async () => {
        console.log('Saving sequence:', sequence)
        DB.updateStartSequenceById(seriesId, sequence)
    }

    const setDefaultSequence = () => {
        setSequence([
            {
                time: 315,
                name: 'warning',
                order: 0,
                hoot: 0,
                flagStatus: [
                    { flag: 'h', status: false },
                    { flag: 'p', status: false }
                ],
                fleetStart: ''
            },
            {
                time: 300,
                name: '5 minutes',
                order: 1,
                hoot: 300,
                flagStatus: [
                    { flag: 'h', status: true },
                    { flag: 'p', status: false }
                ],
                fleetStart: ''
            },
            {
                time: 240,
                name: '4 minutes',
                order: 2,
                hoot: 300,
                flagStatus: [
                    { flag: 'h', status: true },
                    { flag: 'p', status: true }
                ],
                fleetStart: ''
            },
            {
                time: 60,
                name: '1 minute',
                order: 3,
                hoot: 500,
                flagStatus: [
                    { flag: 'h', status: true },
                    { flag: 'p', status: false }
                ],
                fleetStart: ''
            },
            {
                time: 0,
                name: 'Start',
                order: 4,
                hoot: 300,
                flagStatus: [
                    { flag: 'h', status: false },
                    { flag: 'p', status: false }
                ],
                fleetStart: series.fleetSettings[0]?.id || ''
            }
        ])
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
                    <button onClick={() => deleteStep(index)} className='text-red-500'>
                        ✖
                    </button>
                </div>
            ))}

            <Button onClick={addStep} variant={'blue'} className='mx-4'>
                Add Step
            </Button>
            <Button onClick={save} variant={'blue'} className='mx-4'>
                Save
            </Button>
            <Button onClick={setDefaultSequence} variant={'blue'} className='mx-4'>
                Set Default Sequence
            </Button>
        </div>
    )
}

export default StartSequenceManager
