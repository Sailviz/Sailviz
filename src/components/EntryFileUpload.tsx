'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Papa from 'papaparse'
import ProgressModal from './layout/dashboard/ProgressModal'
import * as Fetcher from '@/components/Fetchers'
import * as DB from '@/components/apiMethods'
import { mutate } from 'swr'
export function EntryFileUpload({ raceId }: { raceId: string }) {
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [progressOpen, setProgressOpen] = useState(false)
    const { race, raceIsError, raceIsValidating, mutateRace } = Fetcher.Race(raceId, false)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const entryFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        if (race == null) {
            return
        }
        if (e.target.files == null || e.target.files.length == 0) {
            return
        }
        setProgressOpen(true)
        setProgressValue(0)
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results: any) {
                console.log(results)
                setProgressMax(results.data.length)
                let index = 0
                for (const line of results.data) {
                    setProgressValue(++index)
                    //check if all fields are present
                    if (line.Helm == undefined || line.Crew == undefined || line.Boat == undefined || line.SailNumber == undefined) {
                        alert('missing fields')
                        setProgressOpen(false)

                        return
                    }
                    let result: ResultDataType = {} as ResultDataType
                    if (line.Fleet == undefined) {
                        if (race.fleets.length > 1) {
                            alert("fleets aren't defined and there is more than one fleet in race")
                            return
                        } else {
                            result = await DB.createResult(race.fleets[0]!.id)
                        }
                    } else {
                        //fleet is defined
                        result = await DB.createResult(race.fleets.find(fleet => fleet.fleetSettings.name == line.Fleet)!.id)
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
                    await DB.updateResult(result)
                }
                setProgressOpen(false)
            }
        })
        for (const fleet of race.fleets) {
            mutate(`/api/GetFleetById?id=${fleet.id}`)
        }
    }

    return (
        <>
            <ProgressModal key={progressValue} isOpen={progressOpen} Value={progressValue} Max={progressMax} />
            <Button className='mx-1' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                Upload Entries
            </Button>
            <Input id='entryFileUpload' type='file' accept='.csv' onChange={e => entryFileUploadHandler(e)} className='hidden' />
        </>
    )
}
