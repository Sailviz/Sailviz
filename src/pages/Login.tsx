import Layout from '../components/Layout'
import useSWR from 'swr';
import cookie from 'js-cookie'
import React, { useState } from 'react'
import Router from 'next/router'

const Login = () => {
    const { data } = useSWR('/api/CheckAuthentication', async function (args) {
        const res = await fetch(args);
        return res.json();
    });
    if (data) {
        if (!data.error && data.email) {
            Router.push("/Dashboard");
        }
    }

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const submitData = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        const body = { email, password }
        const res = await fetch(`/api/Authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then((r) => r.json())
            .then((data) => {
                console.log(data)
                if (data && data.error) {
                    setError(data.message);
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

    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    SRM Login
                </h1>
                <form onSubmit={submitData} >
                    <input
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email address"
                        type="email"
                        value={email}
                        className="w-full p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                    />
                    <input
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        value={password}
                        className="w-full p-2 mx-0 my-2 border-4 focus:border-pink-500 rounded focus:outline-none"
                    />
                    <p>{error}</p>
                    <input
                        disabled={!email || !password}
                        type="submit"
                        value="Login"
                        className="m-2 bg-slate-300 border-0 py-4 px-6 text-lg font-medium enabled:bg-pink-500 enabled:hover:bg-pink-400"
                    />
                    <a className="ml-4" href="#" onClick={() => Router.push('/')}>
                        or Cancel
                    </a>
                </form>
            </div>
        </>
    );
};


export default Login;