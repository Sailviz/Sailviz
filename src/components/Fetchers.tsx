'use client'
import useSWR, { mutate } from 'swr'
import * as Sentry from '@sentry/react'
import { useSession } from 'next-auth/react'
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
    console.log(data)
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
    const { data, error, isValidating, mutate } = useSWR(raceId != '' ? `/api/GetRaceById?id=${raceId}&results=${results}` : null, fetcher, {
        fallbackData: {
            id: '',
            number: 0,
            Type: '',
            Time: dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
            Duties: [
                {
                    displayName: '',
                    name: ''
                }
            ],
            fleets: [{ results: [] as ResultDataType[] }]
        } as RaceDataType
    })

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
            raceId: '',
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
    const { data, error, isValidating } = useSWR(fleetId != undefined ? `/api/GetFleetById?id=${fleetId}` : null, fetcher, {
        refreshInterval: 10000
    })

    return {
        fleet: data as FleetDataType,
        fleetIsValidating: isValidating,
        fleetIsError: error
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

export function Roles(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id != '' ? '/api/GetRolesByClubId' : null, url => advancedFetcher(url!, body))

    return {
        roles: data?.roles as RoleDataType[],
        rolesIsValidating: isValidating,
        rolesIsError: error
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

export function GetTodaysRaceByClubId(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id ? '/api/GetTodaysRaceByClubId' : null, url => advancedFetcher(url!, body))

    return {
        todaysRaces: data?.races as NextRaceDataType[],
        todaysRacesIsValidating: isValidating,
        todaysRacesIsError: error
    }
}

export function GetFleetSettingsBySeriesId(seriesId: string) {
    const { data, error, isValidating } = useSWR(seriesId != '' ? `/api/GetFleetSettingsBySeriesId?id=${seriesId}` : null, fetcher, { refreshInterval: 10000 })
    console.log(data)
    return {
        fleetSettings: data as FleetSettingsType[],
        fleetSettingsIsValidating: isValidating,
        fleetSettingsIsError: error
    }
}
