'use client'
import { count } from "console"
import { url } from "inspector"
import useSWR from "swr"


export async function fetcher(url: string) {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

export async function advancedFetcher(url: string, data: object) {
    console.log(data)
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

export function UseUser() {
    const { data, error, isValidating } = useSWR('/api/user', fetcher)

    return {
        user: data as UserDataType,
        userIsValidating: isValidating,
        userIsError: error
    }
}

export function UseClub() {
    const { data, error, isValidating } = useSWR('/api/club', fetcher)

    return {
        club: data as ClubDataType,
        clubIsValidating: isValidating,
        clubIsError: error
    }
}

export function Series(seriesId: string) {
    const { data, error, isValidating } = useSWR(seriesId != "" ? `/api/GetSeriesById?id=${seriesId}` : null, fetcher)
    console.log(data)
    return {
        series: data as SeriesDataType,
        seriesIsValidating: isValidating,
        seriesIsError: error
    }
}

export function Boats() {
    const { data, error, isValidating } = useSWR('/api/GetBoats', fetcher)

    return {
        boats: data?.boats as BoatDataType[],
        boatsIsValidating: isValidating,
        boatsIsError: error
    }
}

export function Users(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id != "" ? '/api/GetUsersByClubId' : null, (url) => advancedFetcher(url!, body))

    return {
        users: data?.users as UserDataType[],
        usersIsValidating: isValidating,
        usersIsError: error
    }
}

export function Roles(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id != "" ? '/api/GetRolesByClubId' : null, (url) => advancedFetcher(url!, body))

    return {
        roles: data?.roles as RoleDataType[],
        rolesIsValidating: isValidating,
        rolesIsError: error
    }
}

export function GetSeriesByClubId(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id ? '/api/GetSeriesByClubId' : null, (url) => advancedFetcher(url!, body), { suspense: true })

    return {
        series: data?.series as SeriesDataType[],
        seriesIsValidating: isValidating,
        seriesIsError: error
    }
}

export function GetTodaysRaceByClubId(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id ? '/api/GetTodaysRaceByClubId' : null, (url) => advancedFetcher(url!, body))

    return {
        todaysRaces: data?.races as NextRaceDataType[],
        todaysRacesIsValidating: isValidating,
        todaysRacesIsError: error
    }
}

export function GetFleetSettingsBySeriesId(seriesId: string) {
    const { data, error, isValidating } = useSWR(seriesId != "" ? `/api/GetFleetSettingsBySeriesId?id=${seriesId}` : null, fetcher)
    console.log(data)
    return {
        fleetSettings: data as FleetSettingsType[],
        fleetSettingsIsValidating: isValidating,
        fleetSettingsIsError: error
    }
}