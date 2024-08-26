'use client'
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import * as DB from 'components/apiMethods';
import * as Fetcher from 'components/Fetchers';
import { PageSkeleton } from 'components/ui/PageSkeleton';
import { Input, Button } from "@nextui-org/react";
import { AVAILABLE_PERMISSIONS, userHasPermission } from "components/helpers/users";


export default function Page() {
    const Router = useRouter();

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()


    if (clubIsValidating || clubIsError || club == undefined) {
        return <PageSkeleton />
    }
    if (userHasPermission(user, AVAILABLE_PERMISSIONS.viewDeveloper))
        return (
            <>
            </>
        )
    else return (
        <div>
            <p> These Settings are unavailable to you.</p>
        </div>
    )
}