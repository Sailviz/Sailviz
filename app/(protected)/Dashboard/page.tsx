'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import UpcomingRacesTable from "components/tables/UpcomingRacesTable";
import { PageSkeleton } from "components/ui/PageSkeleton";
import { Button, useDisclosure } from "@nextui-org/react";
import CreateEventModal from "components/ui/dashboard/CreateEventModal";
import { mutate } from "swr";

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

export default function Page() {
    const Router = useRouter();
    const createModal = useDisclosure();

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const createEvent = async (name: string, numberOfRaces: number) => {
        //create a series
        if (name == "" || numberOfRaces < 1) {
            //show error saying data is invalid
            return
        }
        let series = await DB.createSeries(club.id, name)
        for (let i = 0; i < numberOfRaces; i++) {
            await DB.createRace(club.id, series.id)
        }
        createModal.onClose()
        mutate('/api/GetTodaysRaceByClubId')
    }




    if (userIsError) {
        Router.push('/Login')
    }
    if (clubIsError || clubIsValidating || club == undefined) {
        return <PageSkeleton />
    }

    return (
        <>
            <CreateEventModal isOpen={createModal.isOpen} onSubmit={createEvent} onClose={() => createModal.onClose()} />

            <UpcomingRacesTable club={club} />

            <Button onClick={() => createModal.onOpen()} color='primary'>
                Create New Event
            </Button>
            <Button color={'primary'} isDisabled >
                Practice Mode
            </Button>
        </>
    )
}