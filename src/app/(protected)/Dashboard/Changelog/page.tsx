'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import * as Fetcher from '@/components/Fetchers'
import { PageSkeleton } from '@/components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { signIn, useSession } from 'next-auth/react'

export default function Page() {
    const Router = useRouter()
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn()
        }
    })
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    } else
        return (
            <div>
                <p> List Of Updates.</p>
            </div>
        )
}
