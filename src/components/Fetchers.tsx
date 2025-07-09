'use client'
import useSWR, { mutate } from 'swr'
import * as Sentry from '@sentry/react'

import dayjs from 'dayjs'

export async function fetcher(url: string) {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

export async function fileFetcher(url: string) {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.blob()
}

export async function advancedFetcher(url: string, data: object) {
    console.log(data)
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

export function UseClub() {
    const { data, error, isValidating } = useSWR('/api/club', fetcher)

    return {
        club: data as ClubDataType,
        clubIsValidating: isValidating,
        clubIsError: error
    }
}

export function UseGlobalConfig() {
    const { data, error, isValidating } = useSWR('/api/GlobalConfig', fetcher)

    return {
        GlobalConfig: data as GlobalConfigType,
        GlobalConfigIsValidating: isValidating,
        GlobalConfigIsError: error
    }
}

export function Series(seriesId: string) {
    const { data, error, isValidating, mutate } = useSWR(seriesId != '' ? `/api/GetSeriesById?id=${seriesId}` : null, fetcher)
    return {
        series: data as SeriesDataType,
        seriesIsValidating: isValidating,
        seriesIsError: error,
        mutateSeries: mutate
    }
}

/**
 * This is a fetcher for a race
 * @param raceId id of race to be fetched
 * @param results whether to include results
 * @returns
 */
export function Race(raceId: string, results: boolean) {
    const { data, error, isValidating, mutate } = useSWR(raceId != '' ? `/api/GetRaceById?id=${raceId}&results=${results}` : null, fetcher)

    return {
        race: data as RaceDataType,
        raceIsValidating: isValidating,
        raceIsError: error,
        mutateRace: mutate
    }
}

export function Result(resultId: string) {
    const { data, error, isValidating, mutate } = useSWR(resultId != '' ? `/api/GetResultById?id=${resultId}` : null, fetcher, {
        fallbackData: {
            id: '',
            fleetId: '',
            boat: {
                id: '',
                name: '',
                clubId: '',
                crew: 0,
                py: 0,
                pursuitStartTime: 0
            } as BoatDataType,
            Helm: '',
            Crew: '',
            SailNumber: '',
            finishTime: 0,
            CorrectedTime: 0,
            laps: [{} as LapDataType],
            numberLaps: 0,
            PursuitPosition: 0,
            HandicapPosition: 0
        } as ResultDataType
    })

    return {
        result: data.result as ResultDataType,
        resultIsValidating: isValidating,
        resultIsError: error,
        mutateResult: mutate
    }
}

export function Fleet(fleetId: string) {
    const { data, error, isValidating } = useSWR(fleetId != undefined ? `/api/GetFleetById?id=${fleetId}` : null, fetcher)

    return {
        fleet: data as FleetDataType,
        fleetIsValidating: isValidating,
        fleetIsError: error
    }
}

export function Clubs() {
    const { data, error, isValidating } = useSWR(`/api/GetClubs`, fetcher)

    return {
        clubs: data.clubs as ClubDataType[],
        clubsIsValidating: isValidating,
        clubsIsError: error
    }
}

export function FleetSettings(fleetId: string) {
    const { data, error, isValidating } = useSWR(fleetId != undefined ? `/api/GetFleetSettingsById?id=${fleetId}` : null, fetcher)

    return {
        fleetSettings: data as FleetSettingsType,
        fleetSettingsIsValidating: isValidating,
        fleetSettingsIsError: error
    }
}

export function Boats() {
    const { data, error, isValidating, mutate } = useSWR('/api/GetBoats', fetcher)

    return {
        boats: data?.boats as BoatDataType[],
        boatsIsValidating: isValidating,
        boatsIsError: error,
        mutateBoats: mutate
    }
}

export function Boat(boatId: string) {
    const { data, error, isValidating, mutate } = useSWR(boatId != undefined ? `/api/GetBoatById?boatId=${boatId}` : null, fetcher)

    return {
        boat: data?.boat as BoatDataType,
        boatIsValidating: isValidating,
        boatIsError: error,
        mutateBoats: mutate
    }
}

export function Trackers() {
    const { data, error, isValidating } = useSWR('/api/Trackable/GetTrackers', fetcher)

    return {
        trackers: data?.trackers as TrackerDataType[],
        trackersIsValidating: isValidating,
        trackersIsError: error
    }
}

/**
 *
 * @param fleetId
 * @returns
 */
export function ExportResults(fleetId: string) {
    const { data, error, isValidating } = useSWR(fleetId != '' ? `/api/ExportResults?id=${fleetId}` : null, fetcher)
    console.log(data)
    return {
        file: data,
        fileIsValidating: isValidating,
        fileIsError: error
    }
}

export function Users(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id != '' ? '/api/GetUsersByClubId' : null, url => advancedFetcher(url!, body))

    return {
        users: data?.users as UserDataType[],
        usersIsValidating: isValidating,
        usersIsError: error
    }
}

export function User(id: string) {
    let body = { id: id }
    const { data, error, isValidating } = useSWR(id != '' ? '/api/GetUserById' : null, url => advancedFetcher(url!, body))

    return {
        user: data?.user as UserDataType,
        userIsValidating: isValidating,
        userIsError: error
    }
}

export function Roles(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id != '' ? '/api/GetRolesByClubId' : null, url => advancedFetcher(url!, body))

    return {
        roles: data?.roles as RoleDataType[],
        rolesIsValidating: isValidating,
        rolesIsError: error
    }
}

export function Role(id: string) {
    let body = { id: id }
    const { data, error, isValidating } = useSWR(id != '' ? `/api/GetRoleById?id=${id}` : null, url => advancedFetcher(url!, body))

    return {
        role: data?.role as RoleDataType,
        roleIsValidating: isValidating,
        roleIsError: error
    }
}

export function GetSeriesByClubId(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id ? '/api/GetSeriesByClubId' : null, url => advancedFetcher(url!, body))

    return {
        series: data?.series as SeriesDataType[],
        seriesIsValidating: isValidating,
        seriesIsError: error
    }
}

export function GetSeriesById(seriesId: string) {
    let body = { seriesId: seriesId }
    const { data, error, isValidating } = useSWR('/api/GetSeriesById', url => advancedFetcher(url!, body))

    return {
        series: data?.series as SeriesDataType,
        seriesIsValidating: isValidating,
        seriesIsError: error
    }
}

export function GetTodaysRaceByClubId(clubId?: string) {
    const { data, error, isValidating } = useSWR(clubId ? '/api/GetTodaysRaceByClubId' : null, url => advancedFetcher(url, { clubId }), {
        suspense: true,
        fallbackData: { fleets: [] }
    })
    return {
        todaysRaces: data?.races as RaceDataType[],
        todaysRacesIsValidating: isValidating,
        todaysRacesIsError: error,
        mutateTodaysRaces: mutate
    }
}

export function GetFleetSettingsBySeriesId(seriesId: string) {
    const { data, error, isValidating } = useSWR(seriesId != '' ? `/api/GetFleetSettingsBySeriesId?id=${seriesId}` : null, fetcher)
    console.log(data)
    return {
        fleetSettings: data as FleetSettingsType[],
        fleetSettingsIsValidating: isValidating,
        fleetSettingsIsError: error
    }
}

export function GetStartSequence(seriesId: string) {
    let body = { seriesId: seriesId }
    const {
        data,
        error,
        isValidating,
        mutate: mutateStartSequence
    } = useSWR(seriesId != '' ? `/api/GetStartSequenceById` : null, url => advancedFetcher(url!, body), { fallbackData: [] as StartSequenceStep[] })

    return {
        startSequence: data.sequence as StartSequenceStep[],
        startSequenceIsValidating: isValidating,
        startSequenceIsError: error,
        mutateStartSequence
    }
}
