'use client'
import cookie from 'js-cookie'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from "next/navigation"

export default function Page() {

    const searchParams = useSearchParams();
    const router = useRouter()


    const sendLoginRequest = async (uuid: string) => {
        const body = { uuid }
        const res = await fetch(`/api/autoAuthenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then((r) => r.json())
            .then((data) => {
                console.log(data)
                if (data && data.error) {
                    console.log(data.error)
                }
                if (data && data.token) {
                    //set cookie
                    cookie.set('token', data.token, { expires: 2 });
                    cookie.set('clubId', data.user.clubId, { expires: 2 });
                    cookie.set('userId', data.user.id, { expires: 2 })
                    router.push(data.user.startPage);
                }
                else {
                    console.error("no token with login request")
                    console.log(data)
                }
            });
    };

    useEffect(() => {
        const uuid = searchParams.get('uuid');
        console.log(uuid)
        if (uuid != undefined) {
            sendLoginRequest(uuid)
        }
    }, [router])

    return (
        <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                Logging in
            </h1>
            <a className="ml-4" href="#" onClick={() => router.push('/')}>
                or Cancel
            </a>
        </div>
    );
};