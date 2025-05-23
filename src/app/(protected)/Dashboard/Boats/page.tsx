import { ChangeEvent, MouseEventHandler } from 'react'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'

import { PageSkeleton } from '@/components/layout/PageSkeleton'
import Papa from 'papaparse'
import BoatTable from '@/components/tables/BoatTable'
import EditBoatModal from '@/components/layout/dashboard/EditBoatModal'
import { userHasPermission, AVAILABLE_PERMISSIONS } from '@/components/helpers/users'
import { title } from '@/components/layout/home/primitaves'
import CreateBoatModal from '@/components/layout/dashboard/CreateBoatModal'
import { useSession, signIn } from 'next-auth/react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function Page() {
    const session = await auth()

    // const editModal = useDisclosure()
    // const createModal = useDisclosure()

    // const boatFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    //     Papa.parse(e.target.files![0]!, {
    //         header: true,
    //         skipEmptyLines: true,
    //         complete: async function (incomingboats: any) {
    //             console.log(incomingboats.data)
    //             for (const boat of incomingboats.data) {
    //                 //check if all fields are present
    //                 if (boat.Name == undefined || boat.Crew == undefined || boat.PY == undefined) {
    //                     alert('missing fields')
    //                     return
    //                 }
    //                 let DBboat = boats.find(DBboat => DBboat.name == boat.Name)
    //                 if (DBboat == undefined) {
    //                     await DB.createBoat(boat.Name, parseInt(boat.Crew), parseInt(boat.PY), parseInt(boat.pursuitStartTime || 0), club.id)
    //                 } else {
    //                     //check if uploaded boat is different from existing boat
    //                     if (
    //                         DBboat.name == boat.Name &&
    //                         DBboat.crew == parseInt(boat.Crew) &&
    //                         DBboat.py == parseInt(boat.PY) &&
    //                         DBboat.pursuitStartTime == parseInt(boat.pursuitStartTime || 0)
    //                     ) {
    //                     } else {
    //                         DB.updateBoatById({
    //                             ...DBboat,
    //                             name: boat.Name,
    //                             crew: parseInt(boat.Crew),
    //                             py: parseInt(boat.PY),
    //                             pursuitStartTime: parseInt(boat.pursuitStartTime || 0)
    //                         })
    //                     }
    //                 }
    //             }
    //             //mutate boats
    //             alert('boats updated')
    //         }
    //     })
    // }

    // const downloadBoats = async () => {
    //     var csvRows: string[] = []
    //     const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

    //     csvRows.push(headers.join(','))

    //     boats.forEach(boat => {
    //         var values = [boat.name, boat.crew, boat.py, boat.pursuitStartTime]
    //         //join values with comma
    //         csvRows.push(values.join(','))
    //     })
    //     //join results with new line
    //     let data = csvRows.join('\n')

    //     // Creating a Blob for having a csv file format
    //     // and passing the data with type
    //     const blob = new Blob([data], { type: 'text/csv' })

    //     // Creating an object for downloading url
    //     const url = window.URL.createObjectURL(blob)

    //     // Creating an anchor(a) tag of HTML
    //     const a = document.createElement('a')

    //     // Passing the blob downloading url
    //     a.setAttribute('href', url)

    //     // Setting the anchor tag attribute for downloading
    //     // and passing the download file name
    //     a.setAttribute('download', club.name + 'boats.csv')

    //     // Performing a download with click
    //     a.click()
    // }

    // const updateBoat = async (boat: BoatDataType) => {
    //     editModal.onClose()
    //     console.log(boat)
    //     await DB.updateBoatById(boat)
    //     mutate boats
    //     mutateBoats()
    // }

    // const editBoat = (boat: BoatDataType) => {
    //     console.log(boat)
    //     setEditingBoat(boat)
    //     editModal.onOpen()
    //     mutateBoats()
    // }

    // const deleteBoat = async (boat: BoatDataType) => {
    //     const tempdata = boats
    //     tempdata.splice(
    //         tempdata.findIndex((x: BoatDataType) => x.id === boat.id),
    //         1
    //     )
    //     //mutate boats
    //     await DB.deleteBoatById(boat.id)
    // }

    // const createBoat = async (boat: BoatDataType) => {
    //     const res = await DB.createBoat(boat.name, boat.crew, boat.py, boat.pursuitStartTime, club.id)
    //     if (res) {
    //         mutateBoats()
    //     } else {
    //         alert('Boat Creation Failed')
    //     }
    //     mutateBoats()
    //     createModal.onClose()
    // }

    return (
        <>
            {/* <EditBoatModal
                isOpen={editModal.isOpen}
                boat={editingBoat}
                onSubmit={updateBoat}
                onClose={() => {
                    editModal.onClose()
                    setEditingBoat(undefined)
                }}
            /> */}
            {/* <CreateBoatModal isOpen={createModal.isOpen} onSubmit={createBoat} onClose={() => createModal.onClose()} /> */}
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Boats</h1>
            </div>
            <div className='p-6'>
                {userHasPermission(session!.user, AVAILABLE_PERMISSIONS.editBoats) ? (
                    <div className='flex flex-row p-6 justify-around'>
                        {/* <Button className='mx-1' color='primary' onClick={() => document.getElementById('entryFileUpload')!.click()}>
                            Upload Boat Data
                        </Button>
                        <Input id='entryFileUpload' type='file' accept='.csv' className='hidden' />
                        <Button className='mx-1' color='primary'>
                            Download Boat Data
                        </Button>
                        <Button className='mx-1' color='primary'>
                            Add Boat
                        </Button> */}
                    </div>
                ) : (
                    <></>
                )}
                <BoatTable />
            </div>
        </>
    )
}
