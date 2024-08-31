'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as DB from 'components/apiMethods';
import Cookies from "js-cookie";
import SignOnTable from "components/tables/SignOnTable";
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from "components/ui/PageSkeleton";
import { Button, useDisclosure } from "@nextui-org/react";
import CreateResultModal from "components/ui/SignOn/CreateResultModal";
import EditResultModal from "components/ui/SignOn/EditResultModal";
import { mutate } from "swr";

const SignOnPage = () => {

    const Router = useRouter()

    const createModal = useDisclosure();
    const editModal = useDisclosure();

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()
    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(club)

    const [races, setRaces] = useState<RaceDataType[]>()

    const [activeResult, setActiveResult] = useState<ResultsDataType>()

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    const [selectedOption, setSelectedOption] = useState({ label: "", value: {} as BoatDataType })

    const [selectedRaces, setSelectedRaces] = useState<boolean[]>([]);



    const createResult = async (fleetId: string, helm: string, crew: string, boat: BoatDataType, sailNum: string) => {


        let entry = await DB.createResult(fleetId)

        entry.Helm = helm
        entry.Crew = crew
        entry.boat = boat
        entry.SailNumber = sailNum

        //then update it with the info
        await DB.updateResult(entry)
        //update local state
        let racesCopy = window.structuredClone(races)
        console.log(racesCopy)
        for (let i = 0; i < racesCopy.length; i++) {
            console.log(racesCopy[i]!.id)
            racesCopy[i] = await DB.getRaceById(racesCopy[i]!.id)
        }
        // mutate races
        setRaces([...racesCopy])
        return true

    }

    const createResults = async (helm: string, crew: string, boat: BoatDataType, sailNum: string, fleetIds: string[]) => {
        console.log(helm, crew, boat, sailNum, fleetIds)
        createModal.onClose() //close modal

        //check that at least one race is selected
        if (selectedRaces.every((e) => { return !e })) {
            console.log("no races selected")
            return
        }
        races!.forEach(async race => {
            //check if one of the selected fleets is in this race
            const filteredArray = race.fleets.filter(value => fleetIds.includes(value.id));

            if (filteredArray.length == 1) {
                createResult(filteredArray[0]!.id, helm, crew, boat, sailNum)
            }
        })
        mutate('/api/GetTodaysRaceByClubId')
    }

    const updateResult = async (result: ResultsDataType) => {
        await DB.updateResult(result)
        editModal.onClose()


        //local mutation of data
        let racesCopy = window.structuredClone(races)
        for (let i = 0; i < racesCopy.length; i++) {
            console.log(racesCopy[i]!.id)
            racesCopy[i] = await DB.getRaceById(racesCopy[i]!.id)
        }
        setRaces([...racesCopy])
    }

    const deleteResult = async (result: ResultsDataType) => {
        if (!confirm("Are you sure you want to delete this entry")) return
        editModal.onClose()
        await DB.DeleteResultById(result)

        //local mutation of data
        let racesCopy = window.structuredClone(races)
        for (let i = 0; i < racesCopy.length; i++) {
            console.log(racesCopy[i]!.id)
            racesCopy[i] = await DB.getRaceById(racesCopy[i]!.id)
        }
        setRaces([...racesCopy])
    }

    const showEditModal = async (result: ResultsDataType) => {
        setActiveResult(result)
        editModal.onOpen()
    }

    useEffect(() => {
        if (boats == undefined) return
        let tempoptions: { label: string; value: BoatDataType }[] = []
        boats.forEach(boat => {
            tempoptions.push({ value: boat as BoatDataType, label: boat.name })
        })
        setOptions(tempoptions)


    }, [boats])

    useEffect(() => {
        const fetch = async () => {
            setSelectedRaces(new Array(todaysRaces.length).fill(true))
            let tempRaces: RaceDataType[] = []
            for (let i = 0; i < todaysRaces.length; i++) {
                tempRaces[i] = await DB.getRaceById(todaysRaces[i]!.id)
            }
            console.log(tempRaces)
            setRaces([...tempRaces])
        }
        if (todaysRaces == undefined) return
        fetch()

    }, [todaysRaces])


    if (clubIsValidating || boatsIsValidating || races == undefined) {
        return <PageSkeleton />
    }
    console.log(races)
    return (
        <div>
            <CreateResultModal isOpen={createModal.isOpen} races={races} boats={boats} onSubmit={createResults} onClose={createModal.onClose} />
            <EditResultModal isOpen={editModal.isOpen} result={activeResult} boats={boats} onSubmit={updateResult} onDelete={deleteResult} onClose={editModal.onClose} />

            {races.length > 0 ?
                <div className="w-full">

                    <div className="overflow-x-scroll whitespace-nowrap relative">
                        {races.map((race, index) => {
                            return (
                                <div className="m-6 inline-block" key={JSON.stringify(races) + index}>
                                    <div className="text-4xl font-extrabol p-6">
                                        {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                    </div>
                                    <SignOnTable data={race.fleets.flatMap((fleet) => (fleet.results))} updateResult={updateResult} createResult={createResult} clubId={club.id} showEditModal={showEditModal} />
                                </div>
                            )
                        })}
                    </div>
                    <div className="mx-4 my-3 text-center">
                        <Button
                            onClick={createModal.onOpen}
                            color="success"
                            fullWidth
                            size="lg"
                        >
                            Add Entry
                        </Button>
                    </div>
                </div>
                :
                <div>
                    <p className="text-6xl font-extrabol p-6"> No Races Today</p>
                </div>
            }
        </div>
    )
}

export default SignOnPage