'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import { getSession, useSession } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'

export function AddRaceButton({ seriesId }: { seriesId: string }) {
    return (
        <Button
            variant={'blue'}
            onClick={() => {
                trpc.createRace.mutate({ seriesId: seriesId })
            }}
        >
            Add Race
        </Button>
    )
}
