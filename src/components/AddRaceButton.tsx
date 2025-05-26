'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    const { data: session, status } = useSession()
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
