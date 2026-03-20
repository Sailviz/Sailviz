import { type ChangeEvent } from 'react'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import Papa from 'papaparse'
import { title } from '@components/layout/home/primitaves'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import CreateBoatDialog from '@components/layout/dashboard/CreateBoatModal'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@sailviz/auth/client'
import StandardBoatTable from '@components/tables/StandardBoatTable'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })

    const { data: boats } = useQuery(orpcClient.boat.standard.all.queryOptions())

    const createBoatMutation = useMutation(orpcClient.boat.standard.create.mutationOptions())
    const updateBoatMutation = useMutation(orpcClient.boat.standard.update.mutationOptions())

    const boatFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        if (boats == undefined) return
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
                        await createBoatMutation.mutateAsync({
                            name: boat.Name,
                            crew: parseInt(boat.Crew),
                            py: parseInt(boat.PY)
                        })
                    } else {
                        //check if uploaded boat is different from existing boat
                        if (DBboat.name == boat.Name && DBboat.crew == parseInt(boat.Crew) && DBboat.py == parseInt(boat.PY)) {
                        } else {
                            updateBoatMutation.mutateAsync({
                                ...DBboat,
                                name: boat.Name,
                                crew: parseInt(boat.Crew),
                                py: parseInt(boat.PY)
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
        if (boats == undefined) return
        var csvRows: string[] = []
        const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

        csvRows.push(headers.join(','))

        boats.forEach(boat => {
            var values = [boat.name, boat.crew, boat.py]
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
        a.setAttribute('download', 'boats.csv')

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
                <StandardBoatTable />
            </div>
        </div>
    )
}
export const Route = createFileRoute('/admin/boats')({
    component: Page
})
