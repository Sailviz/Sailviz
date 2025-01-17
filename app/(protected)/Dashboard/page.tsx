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
import RacesTable from "../../../components/tables/RacesTable";
import CreateSeriesModal from "../../../components/ui/dashboard/CreateSeriesModal";
import ClubTable from "../../../components/tables/ClubTable";
import {AVAILABLE_PERMISSIONS, userHasPermission} from "../../../components/helpers/users";
import {title} from "../../../components/ui/home/primitaves";

enum raceStateType {
    running,
    stopped,
    reset,
    calculate
}

export default function Page() {
    const Router = useRouter();
    const createModal = useDisclosure();

    const {user, userIsError, userIsValidating} = Fetcher.UseUser()
    const {club, clubIsError, clubIsValidating} = Fetcher.UseClub()

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
        return <PageSkeleton/>
    }

    return (
        <div>
            <CreateEventModal isOpen={createModal.isOpen} onSubmit={createEvent} onClose={() => createModal.onClose()}/>
            <div className="p-6">
                <h1 className={title({color: "blue"})}>{club.displayName}</h1>
            </div>
            <div className="flex flex-row">
                <div>
                    <div>
                        <p className='text-2xl font-bold p-6 pb-1'>
                            Today&apos;s Races
                        </p>
                        <div className='p-6 pt-1'>
                            <UpcomingRacesTable club={club}/>
                        </div>
                    </div>

                    <div>
                        <p className='text-2xl font-bold p-6 pb-1'>
                            Quick Actions
                        </p>
                        <div className="p-6 py-1">
                            <Button onClick={() => createModal.onOpen()} color='primary' fullWidth>
                                Create New Event
                            </Button>
                        </div>
                        <div className="p-6 pt-1">
                            <Button color={'primary'} isDisabled fullWidth>
                                Practice Mode
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}