import cookie from 'js-cookie'
import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"

const AutoLogin = () => {

    const router = useRouter()

    const query = router.query


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
                    //alert(data.message)
                }
                if (data && data.token) {
                    //set cookie
                    cookie.set('token', data.token, { expires: 2 });
                    cookie.set('clubId', data.club, { expires: 2 });
                    cookie.set('userId', data.user, { expires: 2 })
                    Router.push("/Dashboard");
                }
                else {
                    console.error("no token with login request")
                    console.log(data)
                }
            });
    };

    useEffect(() => {
        let uuid = query.uuid as string
        console.log(uuid)
        if (uuid != undefined) {
            sendLoginRequest(uuid)
        }
    }, [router])

    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Logging in
                </h1>
            </div>
        </>
    );
};


export default AutoLogin;