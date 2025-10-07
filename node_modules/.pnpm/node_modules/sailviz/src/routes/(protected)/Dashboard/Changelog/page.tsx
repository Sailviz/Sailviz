'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import * as DB from '@components/apiMethods'
import * as Fetcher from '@components/Fetchers'
import { PageSkeleton } from '@components/layout/PageSkeleton'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'

export default function Page() {
    const navigate = useNavigate()
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
