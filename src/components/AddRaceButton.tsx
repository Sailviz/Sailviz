'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { useSession } from '@/lib/auth-client'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { series, seriesIsError, seriesIsValidating, mutateSeries } = Fetcher.Series(seriesId)
    return (
        <Button
            variant={'blue'}
            onClick={async () => {
                await DB.createRace(session?.user.clubId!, seriesId)
                mutateSeries()
            }}
        >
            Add Race
        </Button>
    )
}
