'use client'
import { url } from "inspector"
import useSWR from "swr"


const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

const advancedFetcher = async (url: string, data: object) => {
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

export function GetSeriesByClubId(club: ClubDataType) {
    let body = { clubId: club?.id }
    const { data, error, isValidating } = useSWR(club && club.id ? '/api/GetSeriesByClubId' : null, (url) => advancedFetcher(url!, body))

    return {
        series: data?.series as SeriesDataType[],
        seriesIsValidating: isValidating,
        seriesIsError: error
    }
}