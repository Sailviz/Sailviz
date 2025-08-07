'use client'
import { ChangeEvent, MouseEventHandler, useState } from 'react'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'

import { PageSkeleton } from '@/components/layout/PageSkeleton'
import Papa from 'papaparse'
import BoatTable from '@/components/tables/BoatTable'
import EditBoatModal from '@/components/layout/dashboard/EditBoatModal'
import { userHasPermission, AVAILABLE_PERMISSIONS } from '@/components/helpers/users'
import { title } from '@/components/layout/home/primitaves'
import CreateBoatModal from '@/components/layout/dashboard/CreateBoatModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import CreateBoatDialog from '@/components/layout/dashboard/CreateBoatModal'

export default function Page() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating, mutateBoats: mutateBoats } = Fetcher.Boats()

    const boatFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (incomingboats: any) {
                console.log(incomingboats.data)
                for (const boat of incomingboats.data) {
                    //check if all fields are present
                    if (boat.Name == undefined || boat.Crew == undefined || boat.PY == undefined) {
                        alert('missing fields')
                        return
                    }
                    let DBboat = boats.find(DBboat => DBboat.name == boat.Name)
                    if (DBboat == undefined) {
                        await DB.createBoat(boat.Name, parseInt(boat.Crew), parseInt(boat.PY), parseInt(boat.pursuitStartTime || 0), club.id)
                    } else {
                        //check if uploaded boat is different from existing boat
                        if (
                            DBboat.name == boat.Name &&
                            DBboat.crew == parseInt(boat.Crew) &&
                            DBboat.py == parseInt(boat.PY) &&
                            DBboat.pursuitStartTime == parseInt(boat.pursuitStartTime || 0)
                        ) {
                        } else {
                            DB.updateBoatById({
                                ...DBboat,
                                name: boat.Name,
                                crew: parseInt(boat.Crew),
                                py: parseInt(boat.PY),
                                pursuitStartTime: parseInt(boat.pursuitStartTime || 0)
                            })
                        }
                    }
                }
                //mutate boats
                alert('boats updated')
            }
        })
    }

    const downloadBoats = async () => {
        var csvRows: string[] = []
        const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

        csvRows.push(headers.join(','))

        boats.forEach(boat => {
            var values = [boat.name, boat.crew, boat.py, boat.pursuitStartTime]
            //join values with comma
            csvRows.push(values.join(','))
        })
        //join results with new line
        let data = csvRows.join('\n')

        // Creating a Blob for having a csv file format
        // and passing the data with type
        const blob = new Blob([data], { type: 'text/csv' })

        // Creating an object for downloading url
        const url = window.URL.createObjectURL(blob)

        // Creating an anchor(a) tag of HTML
        const a = document.createElement('a')

        // Passing the blob downloading url
        a.setAttribute('href', url)

        // Setting the anchor tag attribute for downloading
        // and passing the download file name
        a.setAttribute('download', club.name + 'boats.csv')

        // Performing a download with click
        a.click()
    }

    if (session == null) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Boats</h1>
            </div>
            <div className='p-6'>
                {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editBoats) ? (
                    <div className='flex flex-row p-6 justify-around'>
                        <Button className='mx-1' color='primary' onClick={() => document.getElementById('boatFileUpload')!.click()}>
                            Upload Boat Data
                        </Button>
                        <Input id='boatFileUpload' type='file' accept='.csv' className='hidden' onChange={e => boatFileUploadHandler(e)} />
                        <Button className='mx-1' color='primary' onClick={downloadBoats}>
                            Download Boat Data
                        </Button>
                        <CreateBoatDialog />
                    </div>
                ) : (
                    <></>
                )}
                <BoatTable />
            </div>
        </div>
    )
}
