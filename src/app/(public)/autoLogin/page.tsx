'use client'
import cookie from 'js-cookie'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
    const searchParams = useSearchParams()
    const Router = useRouter()

    const sendLoginRequest = async (uuid: string) => {
        //get csrf token from next-auth
        const csrfRes = await fetch('/api/auth/csrf')
        if (!csrfRes.ok) {
            console.error('Failed to fetch CSRF token:', csrfRes.statusText)
            return
        }
        const { csrfToken } = await csrfRes.json()
        //send manual login request to next-auth
        const res = await fetch('/api/auth/callback/autoLogin', {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uuid, csrfToken, callbackUrl: '/Dashboard' })
        })
        if (res.ok) {
            console.log(res)
            Router.push(res.url)
        } else {
            console.error('Login failed:', res.statusText)
            // Handle login failure (e.g., show an error message)
            alert('Login failed. Please try again.')
        }
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
            <a className='ml-4' href='#' onClick={() => Router.push('/')}>
                or Cancel
            </a>
        </div>
    )
}
