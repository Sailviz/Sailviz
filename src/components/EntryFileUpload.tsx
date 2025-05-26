'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Papa from 'papaparse'
import ProgressModal from './layout/dashboard/ProgressModal'
import { trpc } from '@/lib/trpc'
import { getSession, useSession } from 'next-auth/react'

export function EntryFileUpload({ raceId }: { raceId: string }) {
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [progressIndeterminate, setProgressIndeterminate] = useState(false)
    const [progressOpen, setProgressOpen] = useState(false)
    const [race, setRace] = useState<RaceDataType | null>(null)
    const [boats, setBoats] = useState<BoatDataType[]>([])

    const { data: session, status } = useSession()
    useEffect(() => {
        const fetchRace = async () => {
            setRace(await trpc.race.query({ id: raceId }))
        }
        fetchRace()
        const fetchBoats = async () => {
            const boats = await trpc.boats.query({ clubId: session?.user.clubId! })
            setBoats(boats)
        }
    }, [raceId])

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        if (race == null) {
            return
        }
        setProgressOpen(true)
        setProgressIndeterminate(true)
        setProgressValue(0)
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results: any) {
                console.log(results)
                // setProgressIndeterminate(false)
                // setProgressMax(results.data.length)
                let index = 0
                for (const line of results.data) {
                    // setProgressValue(++index)
                    //check if all fields are present
                    if (line.Helm == undefined || line.Crew == undefined || line.Boat == undefined || line.SailNumber == undefined) {
                        alert('missing fields')
                        // progressModal.onClose()
                        return
                    }
                    let result: ResultsDataType = {} as ResultsDataType
                    if (line.Fleet == undefined) {
                        if (race.fleets.length > 1) {
                            alert("fleets aren't defined and there is more than one fleet in race")
                            return
                        } else {
                            result = await trpc.createResult.mutate({ fleetId: race.fleets[0]!.id })
                        }
                    } else {
                        //fleet is defined
                        result = await trpc.createResult.mutate({ fleetId: race.fleets.find(fleet => fleet.fleetSettings.name == line.Fleet)!.id })
                    }
                    result.Helm = line.Helm
                    result.Crew = line.Crew
                    result.SailNumber = line.SailNumber
                    const boatName = line.Boat
                    let boat = boats.find(boat => boat.name.toUpperCase() == boatName.toUpperCase())
                    if (boat == undefined) {
                        console.error('Boat ' + boatName + ' not found')
                    } else {
                        result.boat = boat
                    }
                    console.log(result)
                    //update with info
                    await trpc.updateResult.mutate({ result: result })
                }
                setProgressOpen(false)
            }
        })
    }

    return (
        <>
            <ProgressModal key={progressValue} isOpen={progressOpen} Value={progressValue} Max={progressMax} Indeterminate={progressIndeterminate} />
            <Button className='mx-1' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                Upload Entries
            </Button>
            <Input id='entryFileUpload' type='file' accept='.csv' onChange={e => entryFileUploadHandler(e)} className='hidden' />
        </>
    )
}
