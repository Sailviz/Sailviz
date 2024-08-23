"use client"
import cookie from 'js-cookie'
import { useState } from 'react'
import { useRouter } from "next/navigation";
import { Input, Button } from "@nextui-org/react";
import * as DB from 'components/apiMethods'

export default function Page() {
    const Router = useRouter();

    const [Error, setError] = useState<string | null>(null);

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function SignIn() {
        let res = await DB.AuthenticateUser(username, password)
        if (res == undefined) {
            setError("Wrong username or password")
            return
        }
        if (res.token) {
            const user: UserDataType = res.user;
            //set cookie
            cookie.set('token', res.token, { expires: 2 });
            cookie.set('clubId', user.clubId, { expires: 2 });
            cookie.set('userId', user.id, { expires: 2 })
            Router.push(user.startPage);
        }
        else {
            console.error("no token with login request")
        }

    };

    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Sign into your account
                </h1>
                <form action={SignIn} >
                    <label htmlFor="username">Email</label>
                    <Input
                        type="text"
                        name='username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    <Input
                        type="password"
                        name='password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button color="primary" type="submit" title='Login' >
                        Sign In
                    </Button>
                    <span className="font-bold">{Error}</span>
                </form>
            </div>
        </>
    );
};