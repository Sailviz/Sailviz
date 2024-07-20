'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';

import { PageSkeleton } from 'components/ui/PageSkeleton';
import Papa from "papaparse";
import BoatTable from "components/tables/BoatTable";


export default function Page() {
    const Router = useRouter();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats(club)

    const boatFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (incomingboats: any) {
                console.log(incomingboats.data)
                for (const boat of incomingboats.data) {
                    //check if all fields are present
                    if (boat.Name == undefined || boat.Crew == undefined || boat.PY == undefined) {
                        alert("missing fields")
                        return
                    }
                    let DBboat = boats.find(DBboat => DBboat.name == boat.Name)
                    if (DBboat == undefined) {
                        await DB.createBoat(boat.Name, parseInt(boat.Crew), parseInt(boat.PY), parseInt(boat.pursuitStartTime || 0), club.id)
                    } else {
                        //check if uploaded boat is different from existing boat
                        if (DBboat.name == boat.Name && DBboat.crew == parseInt(boat.Crew) && DBboat.py == parseInt(boat.PY) && DBboat.pursuitStartTime == parseInt(boat.pursuitStartTime || 0)) {

                        } else {
                            DB.updateBoatById({ ...DBboat, name: boat.Name, crew: parseInt(boat.Crew), py: parseInt(boat.PY), pursuitStartTime: parseInt(boat.pursuitStartTime || 0) })
                        }
                    }
                }
                //mutate boats
                alert("boats updated")
            },
        });
    }

    const downloadBoats = async () => {
        var csvRows: string[] = []
        const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

        csvRows.push(headers.join(','));

        boats.forEach(boat => {
            var values = [boat.name, boat.crew, boat.py, boat.pursuitStartTime]
            //join values with comma
            csvRows.push(values.join(','))
        })
        //join results with new line
        let data = csvRows.join('\n')

        // Creating a Blob for having a csv file format  
        // and passing the data with type 
        const blob = new Blob([data], { type: 'text/csv' });

        // Creating an object for downloading url 
        const url = window.URL.createObjectURL(blob)

        // Creating an anchor(a) tag of HTML 
        const a = document.createElement('a')

        // Passing the blob downloading url  
        a.setAttribute('href', url)

        // Setting the anchor tag attribute for downloading 
        // and passing the download file name 
        a.setAttribute('download', club.name + 'boats.csv');

        // Performing a download with click 
        a.click()
    }

    const updateBoat = async (boat: BoatDataType) => {
        const tempdata = boats
        tempdata[tempdata.findIndex((x: BoatDataType) => x.id === boat.id)] = boat
        //mutate boats
        await DB.updateBoatById(boat)
    }

    const deleteBoat = async (boat: BoatDataType) => {
        const tempdata = boats
        tempdata.splice(tempdata.findIndex((x: BoatDataType) => x.id === boat.id), 1)
        //mutate boats
        await DB.deleteBoatById(boat.id)
    }

    const createBoat = async () => {
        const tempdata = boats
        const Boat: BoatDataType = await DB.createBoat("", 0, 0, 0, club.id)
        console.log(Boat)
        if (Boat) {
            //mutate boats
        } else {
            alert("something went wrong")
        }
    }

    if (boatsIsError || boatsIsValidating || boats == undefined) {
        return <PageSkeleton />
    }
    return (
        <>
            <p className='text-2xl font-bold text-gray-700 p-6'>
                Boats
            </p>
            <div className='p-6'>
                <div className='flex flex-row p-6 justify-around'>
                    <div className="w-1/2 flex px-4">
                        <label className="w-full">
                            <p className=" w-full cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 ">
                                Import Boats
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={boatFileUploadHandler}
                                className="display-none"
                            />
                        </label>
                    </div>
                    <p onClick={downloadBoats} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 w-1/2">
                        Download Boats
                    </p>
                </div>
                <BoatTable data={boats} key={JSON.stringify(boats)} updateBoat={updateBoat} deleteBoat={deleteBoat} createBoat={createBoat} />
            </div>
        </>
    )
}