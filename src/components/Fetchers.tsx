import useSWR from "swr"

const fetcher = async (url: string) => {
    const res = await fetch(url)
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