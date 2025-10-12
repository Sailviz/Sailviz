'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { client } from '@sailviz/auth/client'
import { method } from 'cypress/types/bluebird'
import { useNavigate } from '@tanstack/react-router'
export default function Page() {
    const searchParams = useSearchParams()
    const navigate = useNavigate()

    const sendLoginRequest = async (uuid: string) => {
        // @ts-ignore not sure why this is needed, but it is
        const res = await client.myPlugin.authByUuid({ uuid, fetchOptions: { method: 'POST' } })
        console.log(res)
        navigate({ to: res.data.user.startPage || '/' })
    }

    useEffect(() => {
        const uuid = searchParams.get('uuid')
        console.log(uuid)
        if (uuid != undefined) {
            sendLoginRequest(uuid)
        }
    }, [Router])

    return (
        <div className='container mx-auto flex flex-col items-center justify-center h-screen p-4'>
            <h1 className='text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700'>Logging in</h1>
            <a className='ml-4' href='#' onClick={() => navigate({ to: '/' })}>
                or Cancel
            </a>
        </div>
    )
}
